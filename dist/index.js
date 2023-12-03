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
console.log(figlet.textSync("ROM-CLI"));
program
    .version("1.0.0")
    .description("A simple tool that allows quick search and download of ROMs for various emulators")
    .option("-c, --consoles", "Lists all available consoles")
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
    let downloadLink = "";
    switch (options.library) {
        case "gameboy":
            console.log(figlet.textSync("Nintendo Gameboy"));
            downloadLink = targetUrl + "Nintendo%20Gameboy/";
            librarySearch(downloadLink);
            break;
        case "playstation1":
            console.log(figlet.textSync("PLAYSTATION 1"));
            downloadLink = targetUrl + "Playstation%201/";
            librarySearch(downloadLink);
            break;
        case "playstation2":
            console.log(figlet.textSync("PLAYSTATION 2"));
            downloadLink = targetUrl + "Playstation%202/";
            librarySearch(downloadLink);
            break;
        case "playstation3":
            console.log(figlet.textSync("PLAYSTATION 3"));
            downloadLink = targetUrl + "Playstation%203/ISO/";
            librarySearch(downloadLink);
            break;
        default:
            console.log("Nothing");
    }
}
function librarySearch(url) {
    return __awaiter(this, void 0, void 0, function* () {
        consoleSearch(url).then((selected) => {
            const spaceFill = "%20";
            const title = selected;
            const constructedUrl = url + title.replaceAll(" ", spaceFill);
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
    });
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
                    if (href.includes(".zip") ||
                        href.includes(".7z") ||
                        href.includes(".rar")) {
                        let parsedHref = href.replace(regex, " ");
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
//! Function to simulate typing into a search bar and return the filtered results
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
//! Downloads a file
function downloadFile(url, destinationPath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let startTime = null;
            let previousLoaded = 0;
            let downloadSpeed = 0;
            const response = yield axios({
                method: "get",
                url: url,
                responseType: "stream",
                onDownloadProgress: (progressEvent) => {
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
                    process.stdout.write(`Downloading... ${percentCompleted}% - Speed: ${downloadSpeed.toFixed(2)} KB/s `);
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