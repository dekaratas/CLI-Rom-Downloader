"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const fs = __importStar(require("fs"));
const commander_1 = require("commander");
const figlet_1 = __importDefault(require("figlet"));
const cheerio = __importStar(require("cheerio"));
const puppeteer = __importStar(require("puppeteer"));
const program = new commander_1.Command();
console.log(figlet_1.default.textSync("ASH'S ROM DOWNLOADER"));
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
function typeInSearchBar(url, searchText) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const browser = yield puppeteer.launch({
                headless: "new",
            });
            const page = yield browser.newPage();
            yield page.goto(url);
            // Fetch the HTML content using Puppeteer and pass it to Cheerio
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
            // const updatedContent = await page.content();
            // const updated$ = cheerio.load(updatedContent);
            // const links = updated$("a").filter((index, element) => {
            //   const parentRow = $(element).closest("tr");
            //   return parentRow.css("display") !== "none";
            // });
            // console.log(links);
            // const cleanedLinks: string[] = [];
            // const regex = /\//g;
            // const regexTwo = /\/|%20/g;
            // links.each((index, element) => {
            //   const href = $(element).attr("href");
            //   if (href) {
            //     if (href.slice(href.length - 1) == "/") {
            //       let parsedHref = href.replace(regex, "").replace(regexTwo, " ");
            //       if (!parsedHref.includes("http") && !parsedHref.includes("NoIntro")) {
            //         console.log(parsedHref);
            //         cleanedLinks.push(parsedHref);
            //       }
            //     }
            //   }
            // });
            // links.each((index, element) => {
            //   const href = updated$(element).attr("href");
            //   console.log(href);
            // });
            // updated$("a").each((index, element) => {
            //   const href = $(element).attr("href");
            //   if (href) {
            //     if (href.slice(href.length - 1) == "/") {
            //       let parsedHref = href.replace(regex, "").replace(regexTwo, " ");
            //       if (!parsedHref.includes("http") && !parsedHref.includes("NoIntro")) {
            //         console.log(parsedHref);
            //         links.push(parsedHref);
            //       }
            //     }
            //   }
            // });
            yield browser.close();
        }
        catch (error) {
            console.error("Error:", error);
        }
    });
}
// Usage example
// const targetUrl = "https://squid-proxy.xyz/";
// const searchTerm = "playstation";
// typeInSearchBar(targetUrl, searchTerm);
// const fileUrl =
//   "https://squid-proxy.xyz/Nintendo%20DS/%27Chou%27%20Kowai%20Hanashi%20DS%20-%20Ao%20no%20Shou%20(Japan).zip";
// const savePath = "./downloadedDir.zip";
//! Example of how to download a file and save it in the same directory
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
            const response = yield (0, axios_1.default)({
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
            const response = yield axios_1.default.get(url);
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