/**
 * Accordion Component Exports
 */

import Accordion, { GlassAccordion } from './Accordion';
import AccordionSummary, { GlassAccordionSummary } from './AccordionSummary';
import AccordionDetails, { GlassAccordionDetails } from './AccordionDetails';

export type { 
  AccordionProps, 
  AccordionSummaryProps, 
  AccordionDetailsProps 
} from './types';

export default Accordion;
export { 
  Accordion, 
  GlassAccordion,
  AccordionSummary, 
  GlassAccordionSummary,
  AccordionDetails, 
  GlassAccordionDetails 
};