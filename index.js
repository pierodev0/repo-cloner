#!/usr/bin/env node

const inquirer = require("inquirer");
const chalk = require("chalk");
const figlet = require("figlet");
const simpleGit = require("simple-git");
const fs = require("fs");
const path = require("path");
const clear = require("clear");

// Repositorios predefinidos
const TEMPLATES = {
  "react(tailwind)": "https://github.com/pierodev0/template-react-tailwind.git",
  "react(tsx)": "https://github.com/pierodev0/template-react-typescript.git",
  "express-api": "https://github.com/expressjs/express-generator.git",
  "nextjs-app": "https://github.com/vercel/next.js.git",
};

// Limpiar la terminal
clear();

// Mostrar el título de la aplicación
console.log(
  chalk.blue(figlet.textSync("repo-cloner", { horizontalLayout: "full" })),
);
console.log(
  chalk.green("¡Bienvenido a Template Clon! Vamos a crear un nuevo proyecto."),
);
console.log(chalk.yellow("--------------------------------------------------"));

async function updatePackageJson(projectPath, newName) {
  const packageJsonPath = path.join(projectPath, "package.json");

  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    packageJson.name = newName;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  }
}

async function removeGitFolder(projectPath) {
  const gitPath = path.join(projectPath, ".git");

  if (fs.existsSync(gitPath)) {
    fs.rmSync(gitPath, { recursive: true, force: true });
  }
}

async function promptUser() {
  const questions = [
    {
      type: "list",
      name: "template",
      message: "¿Qué tipo de proyecto quieres crear?",
      choices: Object.keys(TEMPLATES),
    },
    {
      type: "input",
      name: "name",
      message: "¿Cómo quieres llamar a tu proyecto?",
      validate: function (value) {
        if (value.length) {
          if (/^[a-zA-Z0-9-_]+$/.test(value)) {
            return true;
          } else {
            return "El nombre del proyecto solo puede contener letras, números, guiones y guiones bajos";
          }
        } else {
          return "Por favor ingresa un nombre para el proyecto";
        }
      },
    },
  ];

  return inquirer.prompt(questions);
}

async function cloneRepository() {
  try {
    const answers = await promptUser();
    const { template, name } = answers;
    const repoUrl = TEMPLATES[template];

    console.log(chalk.blue(`🚀 Iniciando proyecto: ${name}`));
    console.log(
      chalk.yellow(`Clonando template de ${template} desde: ${repoUrl}`),
    );

    // Clonar el repositorio
    const git = simpleGit();
    await git.clone(repoUrl, name, ["--depth", "1"]);

    // Eliminar el directorio .git existente
    await removeGitFolder(name);

    // Actualizar el package.json
    await updatePackageJson(name, name);

    // Inicializar nuevo repositorio Git
    const projectGit = simpleGit(name);
    await projectGit.init();
    await projectGit.add(".");
    await projectGit.commit("chore: initial project setup 🚀");

    console.log(chalk.green(`\n✅ ¡Proyecto ${name} creado exitosamente!`));
    console.log(chalk.cyan(`\nPara comenzar a trabajar:`));
    console.log(chalk.white(`  cd ${name}`));
    console.log(chalk.white(`  npm install`));
    console.log(chalk.white(`  npm start`));
  } catch (error) {
    console.error(chalk.red("❌ Error durante el proceso:"), error);
  }
}

cloneRepository();
