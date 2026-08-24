import { PdsButton, PdsIcon } from '@pine-ds/react';
import { arrowRight, launch, play } from '@pine-ds/icons/icons';
import { Fragment } from 'react';
import { DemoExchange } from '../../data/demoPrompts';
import './DemoAnswerCard.css';

interface DemoAnswerCardProps {
  exchange: DemoExchange;
}

/**
 * Answer card — Figma node `1455:67445`.
 *
 * 380 wide, radius 16, 16px padding, 16px gap, no stroke (see the CSS — its fill is a
 * gradient whose geometry is not what the raw stops say, and the stroke was removed on
 * 8/20).
 *
 * Its height is NOT fixed: the text wraps to whatever it wraps to and the product block is
 * optional, so the card can be anywhere from ~120px to ~419px. Nothing downstream assumes
 * a height — the rig measures this element and positions the stack from that.
 *
 * Note the inner product block is *named* `pds-alert` in the file but is not one
 * structurally — it's media + title + meta + button, which pds-alert cannot express (it does
 * icon + heading + description + actions). Built from primitives with a real `pds-button`
 * for the CTA.
 */
/**
 * Splits `**bold**` runs out of the answer. The frames really do carry them — `1517:11966`
 * has "Player" as an Inter Bold run inside an otherwise Regular paragraph — and inline bold
 * is permitted agent output, unlike markdown headings which "render as oversized titles in
 * chat and break the conversational feel".
 */
function renderAnswer(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i} className="answer-card__strong">
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    )
  );
}

export function DemoAnswerCard({ exchange }: DemoAnswerCardProps) {
  const { artifact } = exchange;

  return (
    <div className="answer-card">
      <p className="answer-card__text">{renderAnswer(exchange.answer)}</p>

      <div className="answer-card__body">
        {artifact?.kind === 'offer' && (
          <div className="answer-card__product">
            {/* 348x112 band. Falls back to Figma's flat #d5d5d5 when an exchange has no photo. */}
            <div className="answer-card__media">
              {artifact.image && (
                <img className="answer-card__media-img" src={artifact.image} alt="" />
              )}
            </div>

            {/* Row, not a column: the frame puts the CTA beside the titles and centres it
                on them (228 + 8 + 80 = the 316 inside the 16px inline padding). */}
            <div className="answer-card__product-body">
              <div className="answer-card__product-info">
                <div className="answer-card__product-titles">
                  <p className="answer-card__product-title">{artifact.title}</p>
                  <p className="answer-card__product-meta">{artifact.meta}</p>
                </div>
              </div>
              <PdsButton className="answer-card__cta" variant="secondary" size="micro">
                {artifact.cta}
              </PdsButton>
            </div>
          </div>
        )}

        {artifact?.kind === 'citation' && (
          <div className="answer-card__cite">
            <div className="answer-card__cite-body">
              <p className="answer-card__cite-label">{artifact.label}</p>
              <div className="answer-card__cite-source">
                <div className="answer-card__cite-head">
                  <span className="answer-card__cite-thumb">
                    <img src={artifact.thumb} alt="" />
                  </span>
                  <p className="answer-card__cite-title">{artifact.title}</p>
                </div>
                <p className="answer-card__cite-quote">{artifact.quote}</p>
              </div>
            </div>
            <PdsButton variant="tertiary" size="micro">
              {artifact.cta}
              <PdsIcon icon={launch} size="14px" />
            </PdsButton>
          </div>
        )}

        {artifact?.kind === 'video' && (
          <div className="answer-card__video">
            <div className="answer-card__video-thumb">
              <img src={artifact.still} alt="" />
              <span className="answer-card__video-play">
                <PdsIcon icon={play} size="26.667px" />
              </span>
            </div>
            <div className="answer-card__video-info">
              <div className="answer-card__video-titles">
                <p className="answer-card__video-title">{artifact.title}</p>
                <p className="answer-card__video-subtitle">{artifact.subtitle}</p>
              </div>
              <PdsButton variant="secondary" size="micro">
                {artifact.cta}
                {/* Default slot, NOT slot="end" — see the CSS note: Pine 3.26.4 keeps the
                    end-slot wrapper permanently hidden. */}
                <PdsIcon icon={arrowRight} size="14px" />
              </PdsButton>
            </div>
          </div>
        )}

        {artifact?.kind === 'table' && (
          <div
            className={`answer-card__table${
              artifact.footerCta ? '' : ' answer-card__table--no-footer'
            }`}
          >
            <div className="answer-card__table-grid">
              <div
                className={`answer-card__table-row answer-card__table-row--head answer-card__table-row--cols-${artifact.headers.length}`}
              >
                {artifact.headers.map((h) => (
                  <span key={h}>{h}</span>
                ))}
              </div>
              {artifact.rows.map((cells) => (
                <Fragment key={cells[0]}>
                  <div
                    className={`answer-card__table-row answer-card__table-row--cols-${artifact.headers.length}`}
                  >
                    {cells.map((c, i) => (
                      <span key={i}>{c}</span>
                    ))}
                  </div>
                  {artifact.dividers && <div className="answer-card__table-rule" />}
                </Fragment>
              ))}
            </div>
            {artifact.footerCta && (
              <PdsButton variant="tertiary" size="micro">
                {artifact.footerCta}
                <PdsIcon icon={launch} size="14px" />
              </PdsButton>
            )}
          </div>
        )}

        {artifact?.kind === 'form' && (
          <div className="answer-card__form">
            <div className="answer-card__form-fields">
              <p className="answer-card__form-label">{artifact.label}</p>
              {/* Static mock of Pine's `.Input text` in its `filled` state — the address is
                  drawn as already typed, not as a placeholder. */}
              <div className="answer-card__form-input">
                <span className="answer-card__form-value">{artifact.value}</span>
              </div>
            </div>
            <PdsButton className="answer-card__cta" variant="secondary" size="micro">
              {artifact.cta}
            </PdsButton>
          </div>
        )}

        {/*
          The message footer — thumbUp / thumbDown / CopyButton — was here and is REAL: the
          member chat reuses `foundry_chat`'s `Message`, whose footer is exactly that, gated
          only by `useShowMessageActions`. Removed on 8/24 by Allison's call, not because it
          was wrong. Worth knowing it half-agrees with the product: `ratings_enabled` defaults
          OFF for Sales and ON for Teaching (`ai/chatbot/settings.rb:67`), so a faithful build
          would show it on the Teaching tab only — which is still an open question with the
          pod, since the frontend gate for that flag was never found.
        */}
      </div>
    </div>
  );
}
