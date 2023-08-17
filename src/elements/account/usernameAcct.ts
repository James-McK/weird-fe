import { aCreateElement } from "../../utils.js";
import { putChildrenInCurryContainer, setAnchorHref, setImgSrc, setInnerText, setTitle } from "../../curryingUtils.js";
import { Account } from "../../models/account";
import * as consts from "../../consts.js";
import CustomHTMLElement from "../customElement.js";

const sheet = new CSSStyleSheet();
sheet.replaceSync(`
:host {
	display: flex;
	align-items: center;
}

.acct {
	display: flex;
	align-items: center;
	color: var(--accent);
}

.username {
	color: var(--text);
	margin: 0;
	display: flex;
	align-items: center;
}

.instance {
	color: var(--subtext);
}

.favicon {
	margin-left: 0.5rem;
	width: 16px;
	height: 16px;
}
`);

export default class UsernameAcct extends CustomHTMLElement {
	static async build(account: Account): Promise<CustomHTMLElement> {
		let [username, instance] = account.acct.split("@");

		// assuming that the only case where instance wouldn't be defined here is if the account is on the user's own instance
		if (!instance) instance = consts.userSelectedInstance;

		return Promise.all([
			aCreateElement("a", "acct")
				.then(setAnchorHref(`/${consts.accountsPath}/${account.id}`))
				.then((acct) => {
					Promise.all([
						aCreateElement("span", "username").then(setInnerText("@" + username)),
						aCreateElement("span", "instance").then(setInnerText("@" + instance)),
					]).then(putChildrenInCurryContainer(acct));
					return acct;
				}),
			account.akkoma ? this.#constructInstanceFavicon(account.akkoma.instance) : "",
		]).then(this.createNew);
	}

	static #constructInstanceFavicon(instance: any | undefined) {
		if (!instance || !instance.favicon) return "";

		let title = instance.name;
		if (
			instance.nodeinfo &&
			instance.nodeinfo.software &&
			instance.nodeinfo.software.name &&
			instance.nodeinfo.software.version
		) {
			title += " (" + instance.nodeinfo.software.name + " " + instance.nodeinfo.software.version + ")";
		}

		return aCreateElement("img", "favicon").then(setImgSrc(instance.favicon)).then(setTitle(title));
	}

	protected static createNew(elements: (HTMLElement | string)[]): CustomHTMLElement {
		return new UsernameAcct(sheet, elements);
	}
}