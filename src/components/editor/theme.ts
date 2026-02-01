export const editorTheme = {
  paragraph: "mb-2",
  heading: {
    h1: "text-4xl font-bold mb-4 mt-6",
    h2: "text-3xl font-semibold mb-3 mt-5",
    h3: "text-2xl font-medium mb-2 mt-4",
    h4: "text-xl font-medium mb-2 mt-3",
    h5: "text-lg font-medium mb-1 mt-2",
    h6: "text-base font-medium mb-1 mt-2",
  },
  list: {
    ul: "list-disc ml-6 mb-2",
    ol: "list-decimal ml-6 mb-2",
    listitem: "mb-1",
    nested: {
      listitem: "ml-6",
    },
  },
  quote: "border-l-4 border-orange-500 pl-4 italic text-muted-foreground my-4",
  code: "font-mono bg-muted px-1.5 py-0.5 rounded text-sm",
  link: "text-orange-500 hover:text-orange-600 underline cursor-pointer",
  text: {
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
    strikethrough: "line-through",
    code: "font-mono bg-muted px-1.5 py-0.5 rounded text-sm",
  },
};
