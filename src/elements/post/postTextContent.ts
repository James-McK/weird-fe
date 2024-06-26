import { CustomEmoji } from "../../models/customEmoji";
import { formatInEmojis, pathToAccount } from "../../utils";
import CustomHTMLElement from "../customElement";
import * as consts from "../../consts";
import { StatusMention } from "../../models/status";

const sheet = new CSSStyleSheet();
sheet.replaceSync(`
:host {
	overflow-wrap: break-word;
	word-break: break-word;
	hyphens: auto;
}

pre {
	white-space: pre-wrap;
}

p {
	margin: 0;
}

a {
	color: var(--accent);
}

/* akkoma sends the inline quote text (RE: <Link to quoted post>) in a span with this class */
.quote-inline {
	display: none;
}

/* but on quoted posts that are also quoting something, probably a good idea to show that it is */
/* TODO get this bit to work again */
.post-quote .quote-inline {
	display: inline;
}

${consts.emojiCSS}
`);

export default class PostTextContent extends CustomHTMLElement {
	public static override tagName = "post-text-content";
	constructor() {
		super(sheet);
	}

	public setData(content: string, emojis: CustomEmoji[], mentions: StatusMention[]) {
		this.replaceAll("content", content, PostTextContent.parseContent, emojis, mentions);
	}

	private static parseContent(content: string, emojis: CustomEmoji[], mentions: StatusMention[]): ChildNode[] {
		const parsedNodes = formatInEmojis(content, emojis);
		PostTextContent.addOnClickListenersToMentions(parsedNodes, mentions);
		return parsedNodes;
	}

	private static addOnClickListenersToMentions(elements: ChildNode[], mentions: StatusMention[]) {
		elements.forEach((element) => PostTextContent.walk(element, mentions));
	}

	private static walk(node: Node, mentions: StatusMention[]) {
		const children = node.childNodes;
		children.forEach((child) => PostTextContent.walk(child, mentions));
		PostTextContent.interceptUrlMentions(node, mentions);
	}

	private static interceptUrlMentions(node: Node, mentions: StatusMention[]) {
		if (!(node instanceof HTMLAnchorElement) || node.className !== "u-url mention") return;

		const mention = mentions.find((mention) => mention.url === node.href);
		if (!mention) return;

		node.title = mention.acct;

		node.dataset["accountId"] = mention.id;

		node.addEventListener("click", this.redirectToAccountPageOnClick);
	}

	private static redirectToAccountPageOnClick(e: MouseEvent) {
		e.preventDefault();

		let targetElement;
		if (e.target instanceof HTMLSpanElement) targetElement = e.target.parentElement;
		else targetElement = e.target as HTMLAnchorElement;

		if (!targetElement) return;

		history.pushState(null, "", pathToAccount(targetElement.dataset["accountId"]!));
		window.dispatchEvent(new Event("popstate"));
	}
}
