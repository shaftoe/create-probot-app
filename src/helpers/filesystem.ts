import path from "path";
import fs from "fs-extra";
import { generate } from "egad";
import { Config } from "./user-interaction";
import { yellow, green } from "./write-help";

export const templatesSourcePath = path.join(__dirname, "../../templates/");

/**
 * Create files and folder structure from Handlebars templates.
 *
 * @param {Config} config configuration object
 */
export async function makeScaffolding(config: Config): Promise<void> {
  // Prepare template folder Handlebars source content merging `templates/__common__` and `templates/<answers.template>`
  const tempDestPath = fs.mkdtempSync("__create_probot_app__");
  [
    path.join(templatesSourcePath, "__common__"),
    path.join(templatesSourcePath, config.template),
  ].forEach((source) => fs.copySync(source, tempDestPath));

  if (fs.existsSync(path.join(tempDestPath, "gitignore")))
    fs.renameSync(
      path.join(tempDestPath, "gitignore"),
      path.join(tempDestPath, ".gitignore")
    );

  const result = await generate(tempDestPath, config.destination, config, {
    overwrite: config.overwrite,
  });

  fs.removeSync(tempDestPath);

  result.forEach((fileInfo) =>
    console.log(
      `${
        fileInfo.skipped
          ? yellow("skipped existing file")
          : green("created file")
      }: ${fileInfo.path}`
    )
  );

  console.log(green("\nFinished scaffolding files!"));
}

export function getTemplates(): string[] {
  return fs
    .readdirSync(templatesSourcePath)
    .filter((path) => path.substr(0, 2) !== "__");
}
