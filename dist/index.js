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
const program = new commander_1.Command();
console.log(figlet_1.default.textSync("ASHCROW'S ROM DOWNLOADER"));
program
    .version("1.0.0")
    .description("A simple download tool that allows quick search and download of ROMs for various emulators")
    .option("-l, --ls [value]", "List directory contents");
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
function getLinks(url) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(url);
            const html = response.data;
            const $ = cheerio.load(html);
            const links = [];
            $("a").each((index, element) => {
                const href = $(element).attr("href");
                if (href) {
                    links.push(href);
                }
            });
            return links;
        }
        catch (error) {
            throw new Error("Error fetching links");
        }
    });
}
const fileUrl = "https://squid-proxy.xyz/Nintendo%20DS/%27Chou%27%20Kowai%20Hanashi%20DS%20-%20Ao%20no%20Shou%20(Japan).zip";
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
    console.log("Found links:", links);
})
    .catch((error) => {
    console.error("Error fetching links:", error);
});
//# sourceMappingURL=index.js.map