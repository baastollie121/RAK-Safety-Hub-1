
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const guideSections = [
    {
        title: 'Using the Document Library',
        content: (
            <div className="prose prose-sm dark:prose-invert max-w-none">
                <p>The Document Library is your central hub for all company compliance documents.</p>
                <ul>
                    <li>It&apos;s organized into four main categories: <strong>Safety, Environmental, Quality, and HR.</strong></li>
                    <li>Click on a category tab (e.g., &quot;Safety&quot;) to see all related documents.</li>
                    <li>Documents are further sorted into sub-sections (e.g., &quot;Safety Manuals&quot;, &quot;Risk Assessments&quot;). Click on any sub-section title to expand it and see the documents inside.</li>
                    <li>To download a document, simply click the <strong>&quot;Download&quot;</strong> button next to its name.</li>
                </ul>
            </div>
        )
    },
    {
        title: 'Chatting with Winston, the AI Consultant',
        content: (
            <div className="prose prose-sm dark:prose-invert max-w-none">
                <p>Winston is your AI expert for any safety-related questions.</p>
                <ul>
                    <li>Type your question into the chat box at the bottom and press Enter or click the Send button.</li>
                    <li>Winston will provide advice based on its knowledge base and general safety principles.</li>
                    <li><strong>For Admins:</strong> You can teach Winston new information by uploading documents to its &quot;Core Memory&quot;. Click the &quot;Upload to Core Memory&quot; button, select a document (like a PDF or Word file), and the AI will analyze and learn from it, making its future answers even more relevant to your company.</li>
                </ul>
            </div>
        )
    },
    {
        title: 'Using the AI Hazard Hunter',
        content: (
            <div className="prose prose-sm dark:prose-invert max-w-none">
                <ol>
                    <li>Click <strong>&quot;Choose File&quot;</strong> to select a clear image of a worksite you want to analyze.</li>
                    <li>A preview of your image will appear in the box.</li>
                    <li>Click the <strong>&quot;Analyze Image&quot;</strong> button.</li>
                    <li>The AI will inspect the image and display the results on the right, including a list of identified hazards, confidence scores, and an overall safety assessment.</li>
                </ol>
            </div>
        )
    },
    {
        title: 'Using the AI Document Generators',
        content: (
            <div className="prose prose-sm dark:prose-invert max-w-none">
                <p>All our generators (HIRA, SHE Plan, SWP, Method Statement) follow a similar, simple process. The more detail you provide, the better the final document will be.</p>
                <ol>
                    <li><strong>Fill the Form:</strong> Carefully fill out all the fields in the form for the document you want to create.</li>
                    <li><strong>Use AI Helpers (HIRA Generator):</strong> For the HIRA Generator, you can click &quot;Suggest Hazards (AI)&quot; to automatically get ideas for potential hazards based on your task title.</li>
                    <li><strong>Generate:</strong> Once the form is complete, click the &quot;Generate&quot; button at the bottom. The AI will assemble your inputs into a professionally formatted document.</li>
                    <li><strong>Review, Save, &amp; Download:</strong> The generated document will appear below the form. You can review it, save it to your &quot;AI Generated Docs&quot; section for later access, or download it directly as a PDF.</li>
                </ol>
            </div>
        )
    },
    {
        title: 'How to Use the Trackers',
        content: (
            <div className="prose prose-sm dark:prose-invert max-w-none">
                <p>The trackers are powerful tools for managing your assets and compliance in real-time.</p>
                <ul>
                    <li><strong>Vehicle &amp; Fleet Tracker:</strong> Add new vehicles to your fleet. Click on any vehicle to go to its detail page where you can report new damage by clicking on the interactive vehicle diagram. This creates a damage log and helps you track maintenance needs.</li>
                    <li><strong>Tool &amp; Equipment Tracker:</strong> Manage your company&apos;s physical assets. You can create custom categories (e.g., &quot;Power Tools&quot;, &quot;Lifting Gear&quot;) and add individual assets to them. Use the search bar to quickly find any asset.</li>
                    <li><strong>Employee Training Tracker:</strong> This is a dynamic spreadsheet for your team&apos;s compliance. Add employees using the button at the bottom. Add new training courses by clicking &quot;Add Custom Course&quot;. Expiry dates are automatically color-coded for quick reference, and a dashboard highlights any training expiring soon.</li>
                    <li><strong>Site &amp; Resource Planner:</strong> Drag employees from the &quot;Personnel Pool&quot; on the left and equipment from the &quot;Equipment Pool&quot; on the right, and drop them onto the desired &quot;Project Site&quot; card in the center to assign them. Click &quot;Generate Report&quot; for a summary of all assignments.</li>
                </ul>
            </div>
        )
    },
]

export default function HowToGuidePage() {
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          How-To Guide
        </h1>
        <p className="text-muted-foreground">
          Your guide to using the tools and features of the RAK Safety Hub.
        </p>
      </header>
       <Card>
            <CardContent className="p-4 md:p-6">
                 <Accordion type="multiple" className="w-full">
                    {guideSections.map((section, index) => (
                        <AccordionItem value={`item-${index}`} key={index}>
                            <AccordionTrigger className="text-lg font-headline hover:no-underline">
                                {section.title}
                            </AccordionTrigger>
                            <AccordionContent className="pt-2">
                                {section.content}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
       </Card>
    </div>
  );
}
