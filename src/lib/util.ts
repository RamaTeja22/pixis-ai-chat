import { p } from "framer-motion/client";
import { url } from "inspector";
import { title } from "process";

export function parseWithCitations(
  text: string,
  citations: { id: number; title: string; url: string }[]
) {
  return text.split(/(\[\d+\])/).map((part, i) => {
    const match = part.match(/\[(\d+)\]/);
    if (match) {
      const id = parseInt(match[1]);
      const cite = citations?.find((c) => c.id === id);
      return (
        <Tooltip key={i}>
          <TooltipTrigger asChild>
            <sup className="cursor-pointer text-blue-600 hover:underline">[{id}]</sup>
          </TooltipTrigger>
          <TooltipContent>
            <p>{cite?.title}</p>
            <p className="text-xs text-gray-500">{cite?.url}</p>
          </TooltipContent>
        </Tooltip>
      );
    }
    return part;
  });
}