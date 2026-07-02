import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionItem {
  id: number;
  question: string;
  answer: string;
}

interface AccordionProps {
  items: AccordionItem[];
}

export default function Accordion({ items }: AccordionProps) {
  const [openId, setOpenId] = useState<number | null>(items[0]?.id ?? null);

  const toggle = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="accordion">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id} className={`accordion__item ${isOpen ? 'accordion__item--open' : ''}`}>
            <button
              className="accordion__trigger"
              onClick={() => toggle(item.id)}
              aria-expanded={isOpen}
              aria-controls={`accordion-panel-${item.id}`}
            >
              <span>{item.question}</span>
              <ChevronDown className="accordion__icon" size={20} />
            </button>
            <div
              id={`accordion-panel-${item.id}`}
              className="accordion__panel"
              role="region"
              hidden={!isOpen}
            >
              <p>{item.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
