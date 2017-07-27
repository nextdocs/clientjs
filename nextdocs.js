$(function () {
    "use stict";
    console.log("===:> NextDocs :<===");

    currentUrl = getCurrentUrl();
    updateDom(currentUrl);

    function updateDom(currentUrl) {
        var relatedApiUrl = `https://nextdocs-webapi.azurewebsites.net/api/topics/related?url=${currentUrl}`;
        var mentionedApiUrl = `https://nextdocs-webapi.azurewebsites.net/api/topics/mentioned?url=${currentUrl}`;
        $.when(
            $.get(relatedApiUrl).then(handleDoneAjax, handleFailAjax),
            $.get(mentionedApiUrl).then(handleDoneAjax, handleFailAjax)
        ).then(updateDomCore);
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

    function updateDomCore(relatedData, mentionedData) {
        var $sideToc = $("#side-doc-outline");
        var $commentsContainer = $("#comments-container");

        if (relatedData && relatedData.items.length !== 0) {
            var $relatedTopicsToc = generateToc("Related topics");
            $sideToc.append($relatedTopicsToc)

            var $relatedTopics = generateTopics("Related topics", relatedData[0].items);
            $commentsContainer.before($relatedTopics);
        }

        if (mentionedData && mentionedData.items.length !== 0) {
            var $mentionedByToc = generateToc("Mentioned by");
            $sideToc.append($mentionedByToc);

            var $mentionedBy = generateTopics("Mentioned by", mentionedData.items);
            $commentsContainer.before($mentionedBy);
        }
    }

    function generateToc(category) {
        return `<h3 style='display: block;'><a href='#${computeId(category)}'>${category}</a></h3>`;
    }

    function generateTopics(category, topics) {
        var title = `<h1 id='${computeId(category)}'>${category}</h1>`;

        var items = topics.map(topic => {
            return `<a href="${topic.url}">${topic.title || topic.url}</a>`
        });

        var content = `<p>${items.join("<br/>")}</p>`;
        var $section = $(title + content);

        return $section;
    }

    function computeId(name) {
        return name.replace(" ", "_").toLowerCase();
    }
});