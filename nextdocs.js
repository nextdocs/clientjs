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