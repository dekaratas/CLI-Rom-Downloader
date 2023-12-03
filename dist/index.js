var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import axios from "axios";
import * as fs from "fs";
import { Command } from "commander";
import figlet from "figlet";
import * as cheerio from "cheerio";
import * as puppeteer from "puppeteer";
import inquirer from "inquirer";
const program = new Command();
console.log(figlet.textSync("ASH'S ROM DOWNLOADER"));
program
    .version("1.0.0")
    .description("A simple tool that allows quick search and download of ROMs for various emulators")
    .option("-c, --consoles [value]", "Lists all available consoles")
    .option("-cs, --consolesearch <value>", "Search for a console")
    .option("-cg, --cgames <value>", "Scroll through a console's library")
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
if (options.consolesearch) {
    const targetUrl = "https://squid-proxy.xyz/";
    typeInSearchBar(targetUrl, options.consolesearch);
}
//! Scroll through a console's library
const consoleURL = "https://squid-proxy.xyz/Nintendo%20Gameboy/";
function consoleSearch(url) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios.get(url);
            const html = response.data;
            const $ = cheerio.load(html);
            const links = [];
            const regex = /\/|%20/g;
            $("a").each((index, element) => {
                const href = $(element).attr("href");
                if (href) {
                    if (href.includes(".zip")) {
                        let parsedHref = href.replace(regex, "").replace(regex, " ");
                        links.push(parsedHref);
                    }
                }
            });
            const selectedLink = yield inquirer.prompt([
                {
                    type: "list",
                    name: "link",
                    message: "Select a file:",
                    choices: links,
                },
            ]);
            return selectedLink.link;
        }
        catch (error) {
            throw new Error("There has been an error!");
        }
    });
}
consoleSearch(consoleURL);
function typeInSearchBar(url, searchText) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const browser = yield puppeteer.launch({
                headless: "new",
            });
            const page = yield browser.newPage();
            yield page.goto(url);
            const content = yield page.content();
            const $ = cheerio.load(content);
            const searchBar = $("#search");
            // Perform actions with Puppeteer
            if (searchBar.length > 0) {
                yield page.type("#search", searchText);
                const updatedContent = yield page.content();
                const parsedContent = updatedContent.replace(/<tr[^>]*hidden[^>]*>.*?<\/tr>\n?/g, "");
                const updated$ = cheerio.load(parsedContent);
                const links = [];
                const regex = /\//g;
                const regexTwo = /\/|%20/g;
                updated$("a").each((index, element) => {
                    const href = $(element).attr("href");
                    if (href) {
                        if (href.slice(href.length - 1) == "/") {
                            let parsedHref = href.replace(regex, "").replace(regexTwo, " ");
                            if (!parsedHref.includes("http") &&
                                !parsedHref.includes("NoIntro")) {
                                console.log(parsedHref);
                                links.push(parsedHref);
                            }
                        }
                    }
                });
            }
            else {
                console.log("Search bar not found.");
            }
            yield browser.close();
        }
        catch (error) {
            console.error("Error:", error);
        }
    });
}
//! Example of how to download a file and save it in the same directory
// const fileUrl =
//   "https://squid-proxy.xyz/Nintendo%20DS/%27Chou%27%20Kowai%20Hanashi%20DS%20-%20Ao%20no%20Shou%20(Japan).zip";
// const savePath = "./downloadedDir.zip";
// downloadFile(fileUrl, savePath)
//   .then(() => {
//     console.log("File downloaded successfully!");
//   })
//   .catch((error) => {
//     console.error("Error downloading file:", error);
//   });
//! Downloads a file
function downloadFile(url, destinationPath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios({
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
        }
        catch (error) {
            throw new Error("Error downloading file");
        }
    });
}
//! Get all of a website's links
function getLinks(url) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios.get(url);
            const html = response.data;
            const $ = cheerio.load(html);
            const links = [];
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
        }
        catch (error) {
            throw new Error("Error fetching links");
        }
    });
}
//# sourceMappingURL=index.js.map