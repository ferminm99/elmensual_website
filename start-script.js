const { spawn } = require("child_process");
const path = require("path");

// Función para iniciar un comando
const startProcess = (command, args, cwd, name) => {
  console.log(`Iniciando ${name}...`);
  const process = spawn(command, args, { cwd, stdio: "inherit", shell: true });

  process.on("close", (code) => {
    if (code !== 0) {
      console.error(`${name} terminó con un código de error: ${code}`);
    } else {
      console.log(`${name} terminó correctamente.`);
    }
  });

  process.on("error", (err) => {
    console.error(`Error al iniciar ${name}:`, err);
  });
};

// Rutas de los directorios
const baseDir = "C:\\GitRepositorios\\elmensual_web";
const apiDir = path.join(baseDir, "api");
const clientDir = path.join(baseDir, "client");
const adminDir = path.join(baseDir, "admin");

// Comandos para iniciar cada servicio
startProcess("node", ["index"], apiDir, "API");
startProcess("yarn", ["dev"], clientDir, "Client");
startProcess("yarn", ["start"], adminDir, "Admin");
