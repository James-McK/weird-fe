import { constructPost } from "./postRendering.js";
import { getIcon } from "./assets.js";
import { Icon } from "./models/icons.js";
import { fetchFederatedTimeline, fetchStatusAndContext, fetchStatusById, fetchUserStatuses } from "./fetchStuff.js";
import { aCreateElement, putChildrenInNewContainer } from "./utils.js";
import {
	addClasses,
	putChildInCurryContainer,
	putChildInNewCurryContainer,
	putChildrenInCurryContainer,
	putChildrenInNewCurryContainer,
	setAnchorHref,
	setInnerText,
} from "./curryingUtils.js";

import { Status, StatusTreeNode } from "./models/status";
import { Context } from "./models/context";

import * as consts from "./consts.js";

const timelineDiv = document.getElementById("timeline-content")!;
const loadingPostsDiv = document.getElementById("loading-posts")!;

/**
 * Main function
 */
async function main() {
	doStuffForUrl();
}

async function doStuffForUrl() {
	const url = new URL(document.location.href);
	const path = url.pathname.split("/");

	switch (path[1]) {
		case consts.accountsPath:
			const accountId = path[2]!;
			// todo also display account information, also filter posts n stuff
			fetchUserStatuses(accountId).then(renderTimeline);
			break;
		case consts.statusesPath:
			const statusId = path[2]!;

			let [status, context] = await fetchStatusAndContext(statusId);
			let postTrees = await putStatusInContext(status, context).then(buildPostTree);
			// todo handle quotes
			renderPostTree(postTrees[0]!)
				.then(putChildrenInCurryContainer(timelineDiv))
				.then(() => {
					scrollToIfReply(status);
					loadingPostsDiv.style.display = "none";
				});

			break;
		default:
			fetchFederatedTimeline().then(renderTimeline);
			break;
	}
}

function scrollToIfReply(status: Status) {
	if (status.in_reply_to_id) scrollToElementWithId("post-" + status.id);
}

function scrollToElementWithId(id: string) {
	document.getElementById(id)!.scrollIntoView();
}

async function putStatusInContext(status: Status, context: Context) {
	return [...context.ancestors, status, ...context.descendants];
}

function renderTimeline(statuses: Status[]) {
	timelineDiv.innerHTML = "";

	Promise.all(statuses.map(fetchPostsUpwards))
		.then((posts) => Promise.all(posts.map(renderPostGroup)))
		.then(putChildrenInCurryContainer(timelineDiv));
}

async function fetchPostsUpwards(post: Status, heightAbove: number = 1): Promise<Status[]> {
	if (post.in_reply_to_id && heightAbove > 0) {
		return fetchStatusById(post.in_reply_to_id)
			.then((fetchedPost) => fetchPostsUpwards(fetchedPost, heightAbove - 1))
			.then((posts) => [...posts, post]);
	} else return [post];
}

async function renderPostGroup(posts: Status[]): Promise<HTMLElement> {
	const postContainer = aCreateElement("div", "post-container");

	if (posts[0]!.in_reply_to_id) {
		constructReplyTopLine(posts[0]!).then(putChildInCurryContainer(await postContainer));
	}

	return Promise.all(posts.map((post, index, { length }) => constructPost(post, index !== length - 1))).then(
		putChildrenInCurryContainer(await postContainer)
	);
}

async function renderPostTree(tree: StatusTreeNode): Promise<HTMLElement[]> {
	const postDiv = await constructPost(tree, tree.children && tree.children.length > 0);

	if (!tree.children || tree.children.length === 0) {
		return [postDiv];
	} else if (tree.children.length === 1) {
		return [postDiv, ...(await renderPostTree(tree.children[0]!))];
	} else {
		return Promise.all(tree.children.map(renderPostTree))
			.then((children) => children.map(putChildrenInNewCurryContainer("post-child-container")))
			.then((childrenDivs) => Promise.all(childrenDivs.map(putChildrenInContainerWithLine)))
			.then(putChildrenInNewCurryContainer("post-children-container"))
			.then((childrenContainer) => {
				return [postDiv, childrenContainer];
			});
	}

	async function putChildrenInContainerWithLine(childrenDiv: HTMLElement) {
		return Promise.all([aCreateElement("div", "post-child-line-connector"), aCreateElement("div", "post-child-line")])
			.then(putChildrenInNewCurryContainer("post-child-line-container"))
			.then((lineContainer) => putChildrenInNewContainer([lineContainer, childrenDiv], "post-child-container-outer"));
	}
}

async function constructReplyTopLine(post: Status) {
	let replyTo = post.mentions.find((mention) => mention.id === post.in_reply_to_account_id);
	// if mention not found, assume they're replying to themselves
	if (!replyTo) replyTo = post.account;

	return Promise.all([
		aCreateElement("div", "avatar-line-top").then(putChildInNewCurryContainer("avatar-line-container")),
		getIcon(Icon.Reply).then(addClasses("post-replies-top-icon")),
		aCreateElement("a", "post-replies-top-text")
			.then(setAnchorHref(`/${consts.statusesPath}/${post.in_reply_to_id}`))
			.then(setInnerText("Reply to " + replyTo!.acct)),
	]).then(putChildrenInNewCurryContainer("post-replies-top"));
}

function buildPostTree(statuses: Status[]): StatusTreeNode[] {
	let tree = [] as StatusTreeNode[];
	for (let i = 0; i < statuses.length; i++) {
		if (statuses[i]!.in_reply_to_id) {
			let parent = statuses.filter((status) => status.id === statuses[i]!.in_reply_to_id).pop() as StatusTreeNode;
			if (!parent.children) {
				parent.children = [];
			}
			parent.children.push(statuses[i]! as StatusTreeNode);
		} else {
			tree.push(statuses[i]! as StatusTreeNode);
		}
	}
	return tree;
}

// Run the main function
main().catch(console.error);
