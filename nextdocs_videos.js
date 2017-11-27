$(function () {
    "use stict";
    console.log("===:> NextDocs :<===");

    currentUrl = getCurrentUrl();
    updateDom(currentUrl);

    function updateDom(currentUrl) {
        var relatedTopicsApiUrl = `https://nextdocs-webapi.azurewebsites.net/api/azure/related/topics?url=${currentUrl}`;
        var relatedVideosApiUrl = `https://nextdocs-webapi.azurewebsites.net/api/azure/related/videos?url=${currentUrl}`;
        var dareTopicsApiUrl = `https://nextdocs-webapi.azurewebsites.net/api/azure/dare/topics?url=${currentUrl}`;
        $.when(
            $.get(relatedTopicsApiUrl).then(handleDoneAjax, handleFailAjax),
            $.get(relatedVideosApiUrl).then(handleVideoDoneAjax, handleFailAjax),
            $.get(dareTopicsApiUrl).then(handleDoneAjax, handleFailAjax)
        ).then(updateDomCore);
    }

    function getCurrentUrl() {
        var parser = document.createElement("a");
        parser.href = window.location.href;
        parser.hostname = parser.hostname.replace("review.docs.microsoft.com", "docs.microsoft.com");
        parser.pathname = parser.pathname.replace("e2eprod-azure-documents", "azure");

        return `${parser.hostname}${parser.pathname}`;
    }

    function handleFailAjax() {
        return $.Deferred().resolve(null).promise();
    }

    function handleDoneAjax(data) {
        if (data && data.items.length !== 0) {
            if (data.items.length > 5) {
                data.items = data.items.slice(0, 5);
            }

            for (var item of data.items) {
                item.url = item.url.replace("/docs.microsoft.com/en-us/", "/review.docs.microsoft.com/en-us/");
                item.url = item.url.replace("/en-us/azure/", "/en-us/e2eprod-azure-documents/");
                item.title = item.title.replace("| Microsoft Docs", "");
            }
        }

        return data;
    }

    function handleVideoDoneAjax(data) {
        if (data && data.items.length !== 0) {
            data.items = data.items.filter(item => {
                if (item.pic_url) {
                    return !item.pic_url.startsWith("http://files.channel9.msdn.com/");
                }

                return false;
            });
        }

        return handleDoneAjax(data);
    }

    function updateDomCore(relatedTopics, relatedVideos, dareTopics) {
        var $sideToc = $("#side-doc-outline");
        var $commentsContainer = $("#comments-container");

        $commentsContainer.before(`
            <hr/>
            <p style="margin-top: 30px;">
                <img style="vertical-align: middle; max-width: 24px;" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAGlSURBVFhH7ZW/SsRAEMYjWohvIBZWkqS219LKQntBEGsLC8vdnGdhZ2HtA5ydTXaDeIVaCL6BjSA2in+wE4s4szsrYcnu5Y6sVX4whPt2Z+ebIbeJOjomYZUNZxIuHyDeUiZ5NBhM09L/EDO5nXJZViKjpfCY7rFwwuSZNiCeaTk8pns0gWZoAiUth6XaPRpJ+vm8MsDkC20Ji919wvJNMlDQlnDY3aOWMHGiDYkDtSkkdveoQef3ylBWrKlNbaBG6gnTPQIGvur22AH/lneY0lGj+6LugGqY7hfZcLZu3RtM9FQRH2Yz/fzDpTcBJrWi88UrSW5CGFjqXy6ofCY+SXITwkCcyXVtQF6R5CaEAXgBDzEXnsckuQlhAC8qZSCTGyS5ad1AWU5B5x/KAFzdpLpp20Dcy2NVnMsnkvy0bSDl+ZY2IM5J8tO6ASZOMS/mYp8kP9VC8LyFA25sfRxg9HcqFy4jkvxUC8HYrjFsvSl4XYOBbzjjZ5ldzJHsx1VobAP67d/FHJwCqaMxhVqOHTp+NDXJEwd8hh9TXuzR0R0dNUTRL4BR+3g3embwAAAAAElFTkSuQmCC">
                <span style="line-height: 22px; margin-left: 5px; vertical-align: middle;">Recommended by Docs</span>
            </p>`);

        if (relatedTopics && relatedTopics.items.length !== 0) {
            var $relatedTopicsToc = generateToc("Related topics");
            $sideToc.append($relatedTopicsToc)

            var $relatedTopics = generateTopics("Related topics", relatedTopics.items);
            $commentsContainer.before($relatedTopics);
        }

        if (relatedVideos && relatedVideos.items.length !== 0) {
            var $relatedVideosToc = generateToc("Related videos");
            $sideToc.append($relatedVideosToc);

            var items = relatedVideos.items.filter(item => item.pic_url)
            var $relatedVideos = generateVideos("Related videos", items, false);
            $commentsContainer.before($relatedVideos);
        }

        if (dareTopics && dareTopics.items.length !== 0) {
            var $dareTopicsToc = generateToc("Users also read");
            $sideToc.append($dareTopicsToc)

            var $dareTopics = generateTopics("Users also read", dareTopics.items);
            $commentsContainer.before($dareTopics);
        }
    }

    function generateToc(category) {
        return `<h3 style='display: block;'><a href='#${computeId(category)}'>${category}</a></h3>`;
    }

    function generateTopics(category, topics, isInternal = true) {
        var title = `<h2 id='${computeId(category)}'>${category}</h2>`;

        var items = topics.map(topic => {
            if (topic.similarity === 0) {
                return `<a href="${topic.url}">${topic.title || topic.url}</a>`
            } else if (isInternal) {
                topic.url = topic.url.replace("https://docs.microsoft.com", "https://review.docs.microsoft.com");
                return `<a href="${topic.url}">${topic.title || topic.url} [Similarity: ${topic.similarity.toPrecision(3)}]</a>`
            } else {
                return `<a href="${topic.url}" target="_blank">${topic.title || topic.url} [Similarity: ${topic.similarity.toPrecision(3)}]</a>`
            }
        });

        var content = `<p>${items.join("<br/>")}</p>`;
        var $section = $(title + content);

        return $section;
    }

    function generateVideos(category, vidoes, isInternal = true) {
        var title = `<h2 id='${computeId(category)}'>${category}</h2>`;

        var items = vidoes.map(video => {
            return `<a style="margin-right: 15px; margin-top: 15px; vertical-align: top; display: inline-block; max-width: 256px;" href="${video.url}"
            target="_blank">
            <img tabindex="0" style="max-width: 256px;" src="${video.pic_url}">
            <br>${video.title}[Similarity: ${video.similarity.toPrecision(3)}]</a>`
        });

        var content = `<p>${items.join("")}</p>`;
        var $section = $(title + content);

        return $section;
    }

    function computeId(name) {
        return name.replace(" ", "_").toLowerCase();
    }
});
