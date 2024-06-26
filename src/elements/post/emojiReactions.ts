import CustomHTMLElement from "../customElement";
import EmojiReaction from "./emojiReaction";
import { EmojiReaction as StatusEmojiReaction } from "../../models/status";

const sheet = new CSSStyleSheet();
sheet.replaceSync(`
:host {
	margin-top: 0.5rem;
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 0.5rem;
	row-gap: 0.5rem;
}
`);

export default class EmojiReactions extends CustomHTMLElement {
	public static override tagName = "emoji-reactions";
	protected static override baseToClone: EmojiReactions;
	public static newClone() {
		if (!this.baseToClone) this.baseToClone = new this();
		return this.baseToClone.cloneNode(true) as EmojiReactions;
	}

	currentReactions: { [key: string]: EmojiReaction } = {};

	constructor() {
		super(sheet);
	}

	public setData(emojiReactions: StatusEmojiReaction[] | undefined) {
		if (!emojiReactions) {
			return; // TODO remove all reactions
		}

		// TODO ???? i think i was sleep deprived when i wrote this
		emojiReactions.forEach((emojiReaction) => {
			if (this.currentReactions[emojiReaction.name]) {
				this.currentReactions[emojiReaction.name]!.setData(emojiReaction);
			} else {
				const reaction = new EmojiReaction();
				reaction.setData(emojiReaction);
				this.currentReactions[emojiReaction.name] = reaction;
				this.append(reaction);
			}
		});
	}
}
