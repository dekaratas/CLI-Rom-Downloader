import axios from "axios";
import * as fs from "fs";
import { Command } from "commander";
import figlet from "figlet";
import * as cheerio from "cheerio";
import * as puppeteer from "puppeteer";
import inquirer from "inquirer";

const program = new Command();

console.log(figlet.textSync("ROM-CLI"));

program
  .version("1.0.0")
  .description(
    "A simple tool that allows quick search and download of ROMs for various emulators"
  )
  .option("-c, --consoles [value]", "Lists all available consoles")
  .option("-f, --find <value>", "Find a console")
  .option("-l, --library <value>", "Scroll through a console's library")
  .option("-g, --game <value>", "Search for a game")
  .parse(process.argv);

const options = program.opts();

//! Get all consoles to list
if (options.consoles) {
  const websiteUrl = "https://squid-proxy.xyz/";
  getLinks(websiteUrl)
    .then((links) => {
      console.log("Found consoles:", links);
    })
    .catch((error) => {
      console.error("Error fetching links:", error);
    });
}
//! Search for a console
if (options.find) {
  const targetUrl = "https://squid-proxy.xyz/";

  typeInSearchBar(targetUrl, options.find);
}

//! Scroll through console's library
if (options.library) {
  const targetUrl = "https://squid-proxy.xyz/";
  switch (options.library) {
    case "gameboy":
      let downloadLink = targetUrl + "Nintendo%20Gameboy/";
      consoleSearch(downloadLink).then((selected) => {
        const spaceFill = "%20";
        const title: string | any = selected;

        const constructedUrl = downloadLink + title.replaceAll(" ", spaceFill);

        const fileName = title.replaceAll(" ", "_");
        const savePath = `./${fileName}`;
        console.log(constructedUrl);
        downloadFile(constructedUrl, savePath)
          .then(() => {
            console.log("File downloaded successfully!");
          })
          .catch((error) => {
            console.error("Error downloading file:", error);
          });
      });
      break;
    case "playstation1":
      console.log(figlet.textSync("PLAYSTATION 1"));
      let playdownloadLink = targetUrl + "Playstation%201/";
      consoleSearch(playdownloadLink).then((selected) => {
        const spaceFill = "%20";
        const title: string | any = selected;

        const constructedUrl =
          playdownloadLink + title.replaceAll(" ", spaceFill);

        const fileName = title.replaceAll(" ", "_");
        const savePath = `./${fileName}`;
        console.log(constructedUrl);
        downloadFile(constructedUrl, savePath)
          .then(() => {
            console.log("File downloaded successfully!");
          })
          .catch((error) => {
            console.error("Error downloading file:", error);
          });
      });
      break;
    default:
      console.log("Nothing");
  }
}

//! Scroll through a console's library
const consoleURL = "https://squid-proxy.xyz/Nintendo%20Gameboy/";
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
        if (href.includes(".zip") || href.includes(".7z")) {
          let parsedHref = href.replace(regex, " ");
          links.push(parsedHref);
        }
      }
    });

    const selectedLink = await inquirer.prompt([
      {
        type: "list",
        name: "link",
        message: "Select a file:",
        choices: links,
      },
    ]);

    return selectedLink.link;
  } catch (error) {
    throw new Error("There has been an error!");
  }
}

//! Function to simulate typing into a search bar and return the filtered results
async function typeInSearchBar(url: string, searchText: string) {
  try {
    const browser = await puppeteer.launch({
      headless: "new",
    });
    const page = await browser.newPage();
    await page.goto(url);

    const content = await page.content();
    const $ = cheerio.load(content);

    const searchBar = $("#search");

    // Perform actions with Puppeteer
    if (searchBar.length > 0) {
      await page.type("#search", searchText);
      const updatedContent = await page.content();
      const parsedContent = updatedContent.replace(
        /<tr[^>]*hidden[^>]*>.*?<\/tr>\n?/g,
        ""
      );
      const updated$ = cheerio.load(parsedContent);

      const links: string[] = [];
      const regex = /\//g;
      const regexTwo = /\/|%20/g;

      updated$("a").each((index, element) => {
        const href = $(element).attr("href");
        if (href) {
          if (href.slice(href.length - 1) == "/") {
            let parsedHref = href.replace(regex, "").replace(regexTwo, " ");
            if (
              !parsedHref.includes("http") &&
              !parsedHref.includes("NoIntro")
            ) {
              console.log(parsedHref);
              links.push(parsedHref);
            }
          }
        }
      });
    } else {
      console.log("Search bar not found.");
    }

    await browser.close();
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
    const response = await axios({
      method: "get",
      url: url,
      responseType: "stream",
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
