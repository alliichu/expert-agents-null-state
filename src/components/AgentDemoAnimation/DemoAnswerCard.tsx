import { PdsButton, PdsIcon } from '@pine-ds/react';
import { copy, thumbDown, thumbUp } from '@pine-ds/icons/icons';
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
export function DemoAnswerCard({ exchange }: DemoAnswerCardProps) {
  const { product } = exchange;

  return (
    <div className="answer-card">
      <p className="answer-card__text">{exchange.answer}</p>

      <div className="answer-card__body">
        {product && (
          <div className="answer-card__product">
            {/* media placeholder — Figma has a flat #d5d5d5 block here, rounded at the top only */}
            <div className="answer-card__media" />
            <div className="answer-card__product-body">
              <div className="answer-card__product-titles">
                <p className="answer-card__product-title">{product.title}</p>
                <p className="answer-card__product-meta">{product.meta}</p>
              </div>
              <PdsButton className="answer-card__cta" variant="secondary" size="micro">
                {product.cta}
              </PdsButton>
            </div>
          </div>
        )}

        <div className="answer-card__feedback">
          <PdsIcon icon={thumbUp} size="12px" />
          <PdsIcon icon={thumbDown} size="12px" />
          <PdsIcon icon={copy} size="12px" />
        </div>
      </div>
    </div>
  );
}
