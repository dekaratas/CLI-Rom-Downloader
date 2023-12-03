import axios from "axios";
import * as fs from "fs";
import { Command } from "commander";
import figlet from "figlet";
import * as cheerio from "cheerio";

const program = new Command();

console.log(figlet.textSync("ASHCROW'S ROM DOWNLOADER"));

program
  .version("1.0.0")
  .description(
    "A simple download tool that allows quick search and download of ROMs for various emulators"
  )
  .option("-l, --ls [value]", "List directory contents");

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

async function getLinks(url: string): Promise<string[]> {
  try {
    const response = await axios.get(url);
    const html = response.data;

    const $ = cheerio.load(html);
    const links: string[] = [];

    $("a").each((index, element) => {
      const href = $(element).attr("href");
      if (href) {
        links.push(href);
      }
    });

    return links;
  } catch (error) {
    throw new Error("Error fetching links");
  }
}

const fileUrl =
  "https://squid-proxy.xyz/Nintendo%20DS/%27Chou%27%20Kowai%20Hanashi%20DS%20-%20Ao%20no%20Shou%20(Japan).zip";
const savePath = "./downloadedDir.zip";

//! Example of how to download a file and save it in the same directory
// downloadFile(fileUrl, savePath)
//   .then(() => {
//     console.log("File downloaded successfully!");
//   })
//   .catch((error) => {
//     console.error("Error downloading file:", error);
//   });

const websiteUrl = "https://squid-proxy.xyz/";

getLinks(websiteUrl)
  .then((links) => {
    console.log("Found consoles:", links);
  })
  .catch((error) => {
    console.error("Error fetching links:", error);
  });
