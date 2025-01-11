import fs from "fs";

export const updateOrAddOutputInSchema = (
  filePath: string,
  newOutputValue: string
) => {
  const schemaContent = fs.readFileSync(filePath, "utf-8");

  const generatorRegex = /generator\s+client\s+{([^}]*)}/s;
  const generatorBlockMatch = schemaContent.match(generatorRegex);

  if (!generatorBlockMatch) {
    throw new Error("The generator block was not found in schema.prisma.");
  }

  const generatorBlockContent = generatorBlockMatch[1];

  const cleanedGeneratorBlockContent = generatorBlockContent
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n  ");

  let updatedGeneratorBlockContent: string;

  if (/output\s*=\s*".*"/.test(cleanedGeneratorBlockContent)) {
    updatedGeneratorBlockContent = cleanedGeneratorBlockContent.replace(
      /output\s*=\s*".*"/,
      `output = "${newOutputValue}"`
    );
  } else {
    updatedGeneratorBlockContent = `${cleanedGeneratorBlockContent}\n  output = "${newOutputValue}"`;
  }

  const updatedGeneratorBlock = `generator client {\n  ${updatedGeneratorBlockContent}\n}`;

  const updatedSchema = schemaContent.replace(
    generatorRegex,
    updatedGeneratorBlock
  );

  fs.writeFileSync(filePath, updatedSchema, "utf-8");
};
