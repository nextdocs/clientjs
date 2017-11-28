$(function () {
    "use stict";
    console.log("===:> NextDocs :<===");

    currentUrl = getCurrentUrl();
    updateDom(currentUrl);

    function updateDom(currentUrl) {
        var relatedApiUrl = `https://nextdocs-webapi.azurewebsites.net/api/topics/related?url=${currentUrl}`;
        $.get(relatedApiUrl)
            .then(handleDoneAjax, handleFailAjax)
            .then(updateDomCore);
    }

    function getCurrentUrl() {
        var parser = document.createElement("a");
        parser.href = window.location.href;
        if (parser.hostname.startsWith("review.")) {
            parser.hostname = parser.hostname.slice("review.".length);
        }

        return `${parser.hostname}${parser.pathname}`;
    }

    function handleFailAjax() {
        return $.Deferred().resolve(null).promise();
    }

    function handleDoneAjax(data) {
        return data;
    }

    function updateDomCore(relatedData) {
        var $sideToc = $("#side-doc-outline");
        var $commentsContainer = $("#comments-container");

        $commentsContainer.before(`
        <hr/>
        <p style="margin-top: 30px;">
            <img style="vertical-align: middle; max-width: 24px;" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAGlSURBVFhH7ZW/SsRAEMYjWohvIBZWkqS219LKQntBEGsLC8vdnGdhZ2HtA5ydTXaDeIVaCL6BjSA2in+wE4s4szsrYcnu5Y6sVX4whPt2Z+ebIbeJOjomYZUNZxIuHyDeUiZ5NBhM09L/EDO5nXJZViKjpfCY7rFwwuSZNiCeaTk8pns0gWZoAiUth6XaPRpJ+vm8MsDkC20Ji919wvJNMlDQlnDY3aOWMHGiDYkDtSkkdveoQef3ylBWrKlNbaBG6gnTPQIGvur22AH/lneY0lGj+6LugGqY7hfZcLZu3RtM9FQRH2Yz/fzDpTcBJrWi88UrSW5CGFjqXy6ofCY+SXITwkCcyXVtQF6R5CaEAXgBDzEXnsckuQlhAC8qZSCTGyS5ad1AWU5B5x/KAFzdpLpp20Dcy2NVnMsnkvy0bSDl+ZY2IM5J8tO6ASZOMS/mYp8kP9VC8LyFA25sfRxg9HcqFy4jkvxUC8HYrjFsvSl4XYOBbzjjZ5ldzJHsx1VobAP67d/FHJwCqaMxhVqOHTp+NDXJEwd8hh9TXuzR0R0dNUTRL4BR+3g3embwAAAAAElFTkSuQmCC">
            <span style="line-height: 22px; margin-left: 5px; vertical-align: middle;">Recommended by Docs</span>
        </p>`);
        
        if (relatedData && relatedData.items.length !== 0) {
            var $relatedTopicsToc = generateToc("Related topics");
            $sideToc.append($relatedTopicsToc)

            var $relatedTopics = generateTopics("Related topics", relatedData.items);
            $commentsContainer.before($relatedTopics);
        }
    }

    function generateToc(category) {
        return `<h3 style='display: block;'><a href='#${computeId(category)}'>${category}</a></h3>`;
    }

    function generateTopics(category, topics, isInternal = true) {
        var title = `<h2 id='${computeId(category)}'>${category}</h2>`;

        var items = topics.map(topic => {
            if (isInternal) {
                topic.url = topic.url.replace("https://docs.microsoft.com", "https://review.docs.microsoft.com");
                return `<a href="${topic.url}">${topic.title || topic.url}</a>`
            } else {
                return `<a href="${topic.url}" target="_blank">${topic.title || topic.url}</a>`
            }
        });

        var content = `<p>${items.join("<br/>")}</p>`;
        var $section = $(title + content);

        return $section;
    }

    function computeId(name) {
        return name.replace(" ", "_").toLowerCase();
    }
});