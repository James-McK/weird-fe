import { createElement } from "./utils.js";

export function putChildrenInCurryContainer(container: HTMLElement) {
	return function (children: (HTMLElement | string)[]) {
		container.append(...children);
		return container;
	};
}

export function putChildInCurryContainer(container: HTMLElement) {
	return function (child: HTMLElement | null) {
		if (child) container.appendChild(child);
		return container;
	};
}

export function putChildInNewCurryContainer(containerClass: string) {
	return function (child: HTMLElement) {
		let container: HTMLElement = createElement("div", containerClass);
		container.appendChild(child);
		return container;
	};
}

export function putChildrenInNewCurryContainer(containerClass: string) {
	return function (children: (HTMLElement | string)[]) {
		let container: HTMLElement = createElement("div", containerClass);
		container.append(...children);
		return container;
	};
}

export function setInnerHTML(html: string) {
	return function (element: HTMLElement) {
		element.innerHTML = html;
		return element;
	};
}

export function setInnerText(text: string) {
	return function (element: HTMLElement) {
		element.innerText = text;
		return element;
	};
}

export function addClasses(classes: string) {
	return function (element: HTMLElement) {
		element.className += " " + classes;
		return element;
	};
}

export function setTitle(title: string) {
	return function (element: HTMLElement) {
		element.title = title;
		return element;
	};
}

export function setId(id: string) {
	return function (element: HTMLElement) {
		element.id = id;
		return element;
	};
}

export function setImgSrc(src: string) {
	return function (img: HTMLElement) {
		(img as HTMLImageElement).src = src;
		return img;
	};
}

export function setAnchorHref(href: string) {
	return function (a: HTMLElement) {
		(a as HTMLAnchorElement).href = href;
		return a;
	};
}

export function setInputType(type: string) {
	return function (input: HTMLElement) {
		(input as HTMLInputElement).type = type;
		return input;
	};
}

export function setLabelHtmlFor(htmlFor: string) {
	return function (label: HTMLElement) {
		(label as HTMLLabelElement).htmlFor = htmlFor;
		return label;
	};
}