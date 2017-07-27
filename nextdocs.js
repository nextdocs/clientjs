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

        if (relatedData != null && relatedData.items.length !== 0) {
            var $relatedTopicsToc = generateToc("Related topics");
            $sideToc.append($relatedTopicsToc)

            var $relatedTopics = generateTopics("Related topics", relatedData[0].items);
            $commentsContainer.before($relatedTopics);
        }

        if (mentionedData != null && mentionedData.items.length !== 0) {
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
        var $category = $(`<h3 style='display: block;' id='${computeId(category)}'>${category}</div>`);
        var $topics = $("<ol></ol>");

        for (var topic of topics) {
            var $item = $(`<li><a href="${topic.url}">${topic.title || topic.url}</a></li>`);
            $topics.append($item);
        }

        $category.append($topics);
        return $category;
    }

    function computeId(name) {
        return name.replace(" ", "_").toLowerCase();
    }
});