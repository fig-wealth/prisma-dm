import fs from "fs";

export const updateOrAddOutputInSchema = (
  filePath: string,
  newOutputValue: string
) => {
  try {
    const schemaContent = fs.readFileSync(filePath, "utf-8");

    const generatorRegex = /generator\s+client\s+{([^}]*)}/s;
    const generatorBlockMatch = schemaContent.match(generatorRegex);

    if (!generatorBlockMatch) {
      throw new Error("The generator block was not found in schema.prisma.");
    }

    const generatorBlockContent = generatorBlockMatch[1];
    let updatedGeneratorBlockContent: string;

    if (/output\s*=\s*".*"/.test(generatorBlockContent)) {
      updatedGeneratorBlockContent = generatorBlockContent.replace(
        /output\s*=\s*".*"/,
        `output = "${newOutputValue}"`
      );
    } else {
      updatedGeneratorBlockContent = `${generatorBlockContent.trim()}\n  output = "${newOutputValue}"`;
    }

    const updatedGeneratorBlock = `generator client {\n${updatedGeneratorBlockContent}\n}`;

    const updatedSchema = schemaContent.replace(
      generatorRegex,
      updatedGeneratorBlock
    );

    fs.writeFileSync(filePath, updatedSchema, "utf-8");
    console.log(`Output successfully updated or added: ${newOutputValue}`);
  } catch (error) {
    console.error("Error while updating or adding output:", error);
  }
};
