import { config } from 'dotenv';
config();

import '@/ai/flows/ai-hazard-hunter.ts';
import '@/ai/flows/ai-safety-consultant.ts';
import '@/ai/flows/method-statement-generator.ts';
import '@/ai/flows/safe-work-procedure-generator.ts';
import '@/ai/flows/document-analyzer.ts';
import '@/ai/flows/hira-suggester.ts';
import '@/ai/flows/she-plan-generator.ts';
import '@/ai/flows/news-scraper-flow.ts';
import '@/ai/flows/risk-assessment-generator.ts';
