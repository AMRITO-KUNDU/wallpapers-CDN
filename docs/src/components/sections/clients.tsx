import { CodeBlock } from "@/components/code-block";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FLUTTER_SNIPPET, JS_SNIPPET, RN_SNIPPET } from "@/lib/snippets";

export function Clients() {
  return (
    <section id="clients" className="scroll-mt-24 mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="grid items-start gap-10 lg:grid-cols-2">
        <div>
          <p className="text-xs font-medium tracking-wide text-subtle uppercase">Clients</p>
          <h2 className="mt-3 font-display text-4xl tracking-tight text-fg sm:text-5xl">
            Fetch JSON.
            <br />
            Render URLs.
          </h2>
          <p className="mt-4 max-w-md text-muted">
            There is no SDK. Point any HTTP client at the index, then use{" "}
            <span className="font-mono text-sm text-fg">url</span> for the wallpaper and{" "}
            <span className="font-mono text-sm text-fg">thumbnail</span> in grids.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-muted">
            <li className="flex gap-3">
              <span className="font-mono text-xs text-subtle">01</span>
              Works with fetch, Dio, http, Alamofire — anything that can GET JSON.
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-xs text-subtle">02</span>
              No API key, CORS header, or rate-limited origin of your own.
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-xs text-subtle">03</span>
              New files appear in the index after the GitHub Action runs.
            </li>
          </ul>
        </div>

        <Tabs defaultValue="js" className="min-w-0">
          <TabsList>
            <TabsTrigger value="js">JavaScript</TabsTrigger>
            <TabsTrigger value="flutter">Flutter</TabsTrigger>
            <TabsTrigger value="rn">React Native</TabsTrigger>
          </TabsList>
          <TabsContent value="js">
            <CodeBlock code={JS_SNIPPET} label="JavaScript / Web" />
          </TabsContent>
          <TabsContent value="flutter">
            <CodeBlock code={FLUTTER_SNIPPET} label="Flutter" />
          </TabsContent>
          <TabsContent value="rn">
            <CodeBlock code={RN_SNIPPET} label="React Native" />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
