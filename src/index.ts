import axios from "axios";
import * as fs from "fs";
import { Command } from "commander";
import figlet from "figlet";
import * as cheerio from "cheerio";
import * as puppeteer from "puppeteer";
import inquirer from "inquirer";
import chalk from "chalk";

const program = new Command();

console.log(chalk.blue.bold(figlet.textSync("ROM-CLI")));

program
  .version("1.0.0")
  .description(
    "A simple tool that allows quick search and download of ROMs for various emulators"
  )
  .option(
    "-c, --consoles",
    "Lists all available consoles and their respective arguments"
  )
  .option("-l, --library <console>", "Scroll through a console's library")
  .option("-g, --game <gameName>", "Search for a game (Only one keyword!)")
  .parse(process.argv);

const options = program.opts();

//! Get all consoles to list
if (options.consoles) {
  const currentConsoles = [
    "PlayStation Portable (psp)",
    "PlayStation 1 (playstation1)",
    "PlayStation 2 (playstation2)",
    "PlayStation 3 (playstation3)",
    "Nintendo Gameboy (gameboy)",
    "Nintendo Wii (wii)",
    "Nintendo Gamecube (gamecube)",
    "Nintendo 64 (n64)",
  ];
  const list: string[] = [];
  for (let i = 0; i < currentConsoles.length; i++) {
    console.log(chalk.green.bold(currentConsoles[i]));
  }
}

//! Search game function
if (options.game) {
  const targetUrl = "https://squid-proxy.xyz/";
  typeInSearchBar(targetUrl, options.game).then((selected) => {
    const spaceFill = "%20";
    const title: string | any = selected;

    const constructedUrl = targetUrl + title.replaceAll(" ", spaceFill);

    const fileName = title.replaceAll(" ", "_").replaceAll("/", "_");

    const savePath = `${fileName}`;
    console.log("Le Constructed URL", constructedUrl);
    downloadFile(constructedUrl, savePath)
      .then(() => {
        console.log("File downloaded successfully!");
      })
      .catch((error) => {
        console.error("Error downloading file:", error);
      });
  });
}

//! Scroll through console's library
if (options.library) {
  const targetUrl = "https://squid-proxy.xyz/";
  let downloadLink = "";
  switch (options.library) {
    case "gameboy":
      console.log(chalk.blue.bold(figlet.textSync("Nintendo Gameboy")));
      downloadLink = targetUrl + "Nintendo%20Gameboy/";
      librarySearch(downloadLink);
      break;
    case "playstation1":
      console.log(chalk.blue.bold(figlet.textSync("PLAYSTATION 1")));
      downloadLink = targetUrl + "Playstation%201/";
      librarySearch(downloadLink);
      break;
    case "playstation2":
      console.log(chalk.blue.bold(figlet.textSync("PLAYSTATION 2")));
      downloadLink = targetUrl + "Playstation%202/";
      librarySearch(downloadLink);
      break;
    case "playstation3":
      console.log(chalk.blue.bold(figlet.textSync("PLAYSTATION 3")));
      downloadLink = targetUrl + "Playstation%203/ISO/";
      librarySearch(downloadLink);
      break;
    case "gamecube":
      console.log(chalk.blue.bold(figlet.textSync("Nintendo Gamecube")));
      downloadLink = targetUrl + "Nintendo%20Gamecube/US/";
      librarySearch(downloadLink);
      break;
    case "n64":
      console.log(chalk.blue.bold(figlet.textSync("Nintendo 64")));
      downloadLink = targetUrl + "Nintendo%2064/Big%20Endian/";
      librarySearch(downloadLink);
      break;
    case "wii":
      console.log(figlet.textSync("Nintendo Wii"));
      downloadLink = targetUrl + "Nintendo%20Wii/ISO/Usa/";
      librarySearch(downloadLink);
      break;
    case "psp":
      console.log(chalk.blue.bold(figlet.textSync("Playstation Portable")));
      downloadLink = targetUrl + "Playstation%20Portable/ISO/";
      librarySearch(downloadLink);
      break;
    default:
      console.log("Nothing");
  }
}

//! Helper function for switch above
async function librarySearch(url: string) {
  consoleSearch(url).then((selected) => {
    const spaceFill = "%20";
    const title: string | any = selected;

    const constructedUrl = url + title.replaceAll(" ", spaceFill);

    const fileName = title.replaceAll(" ", "_");
    const savePath = `./${fileName}`;
    downloadFile(constructedUrl, savePath)
      .then(() => {
        console.log("File downloaded successfully!");
      })
      .catch((error) => {
        console.error("Error downloading file:", error);
      });
  });
}

//! Scroll through a console's library
async function consoleSearch(url: string): Promise<string[] | string> {
  try {
    const response = await axios.get(url);
    const html = response.data;

    const $ = cheerio.load(html);

    const links: string[] = [];
    const regex = /\/|%20/g;
    $("a").each((index, element) => {
      const href = $(element).attr("href");
      if (href) {
        if (
          href.includes(".zip") ||
          href.includes(".7z") ||
          href.includes(".rar")
        ) {
          let parsedHref = href.replace(regex, " ");
          links.push(parsedHref);
        }
      }
    });

    const selectedLink = await inquirer.prompt([
      {
        type: "list",
        name: "link",
        pageSize: "20",
        message: "Select a file:",
        choices: links,
      },
    ]);

    return selectedLink.link;
  } catch (error) {
    console.log(error);
    throw new Error("There has been an error!");
  }
}

//! Function to simulate typing into a search bar and return the filtered results
async function typeInSearchBar(url: string, searchText: string) {
  try {
    const links: string[] = [];
    const consoleURLs = [
      "Nintendo%20Gameboy/",
      "Playstation%201/",
      "Playstation%202/",
      "Playstation%203/ISO/",
      "Nintendo%20Gamecube/US/",
      "Nintendo%2064/Big%20Endian/",
      "Nintendo%20Wii/ISO/Usa/",
      "Playstation%20Portable/ISO/",
    ];

    for (let consoleURL of consoleURLs) {
      const newUrl = url + consoleURL;

      const browser = await puppeteer.launch({
        headless: "new",
      });
      const page = await browser.newPage();
      await page.goto(newUrl);
      const content = await page.content();
      const $ = cheerio.load(content);

      const searchBar = $("#search");

      if (searchBar.length > 0) {
        await page.type("#search", searchText);
        const updatedContent = await page.content();
        const parsedContent = updatedContent.replace(
          /<tr[^>]*hidden[^>]*>.*?<\/tr>\n?/g,
          ""
        );
        const updated$ = cheerio.load(parsedContent);

        const regex = /\//g;
        const regexTwo = /\/|%20/g;

        updated$("a").each((index, element) => {
          const href = $(element).attr("href");
          if (href) {
            let parsedHref = href.replace(regex, "").replace(regexTwo, " ");
            if (
              !parsedHref.includes("http") &&
              !parsedHref.includes("NoIntro") &&
              !parsedHref.includes("?C")
            ) {
              console.log(parsedHref);
              console.log(href);
              console.log(newUrl);
              links.push(consoleURL + parsedHref);
            }
          }
        });
      }
    }
    const selectedLink = await inquirer.prompt([
      {
        type: "list",
        name: "link",
        pageSize: "20",
        message: "Select a file:",
        choices: links,
      },
    ]);
    return selectedLink.link;
  } catch (error) {
    console.error("Error:", error);
  }
}

//! Downloads a file
async function downloadFile(
  url: string,
  destinationPath: string
): Promise<void> {
  try {
    let startTime: number | null = null;
    let previousLoaded = 0;
    let downloadSpeed = 0;
    const response = await axios({
      method: "get",
      url: url,
      responseType: "stream",
      onDownloadProgress: (progressEvent: any) => {
        const currentTime = Date.now();
        const elapsedTime = (currentTime - (startTime || currentTime)) / 1000;

        if (!startTime) {
          startTime = currentTime;
        }

        const loaded = progressEvent.loaded;
        const total = progressEvent.total || 0;

        const percentCompleted = Math.floor((loaded * 100) / total);
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        process.stdout.write(
          `Downloading... ${percentCompleted}% - Speed: ${downloadSpeed.toFixed(
            2
          )} KB/s `
        );

        downloadSpeed = (loaded - previousLoaded) / 1024 / elapsedTime;
        previousLoaded = loaded;
      },
    });

    const writer = fs.createWriteStream(destinationPath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });
  } catch (error) {
    throw new Error("Error downloading file");
  }
}

//! Get all of a website's links
async function getLinks(url: string): Promise<string[]> {
  try {
    const response = await axios.get(url);
    const html = response.data;

    const $ = cheerio.load(html);
    const links: string[] = [];
    const regex = /\//g;
    const regexTwo = /\/|%20/g;
    $("a").each((index, element) => {
      const href = $(element).attr("href");
      if (href) {
        if (href.slice(href.length - 1) == "/") {
          let parsedHref = href.replace(regex, "").replace(regexTwo, " ");
          if (!parsedHref.includes("http") && !parsedHref.includes("NoIntro")) {
            links.push(parsedHref);
          }
        }
      }
    });

    return links;
  } catch (error) {
    throw new Error("Error fetching links");
  }
}
