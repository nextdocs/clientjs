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
            $.get(relatedVideosApiUrl).then(handleDoneAjax, handleFailAjax),
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
                item.url = item.url.replace("/en-us/azure/", "/en-us/e2eprod-azure-documents/");
                item.title = item.title.replace("| Microsoft Docs", "");
            }
        }

        return data;
    }

    function updateDomCore(relatedTopics, relatedVideos, dareTopics) {
        var $sideToc = $("#side-doc-outline");
        var $commentsContainer = $("#comments-container");

        if (relatedTopics && relatedTopics.items.length !== 0) {
            var $relatedTopicsToc = generateToc("Related topics");
            $sideToc.append($relatedTopicsToc)

            var $relatedTopics = generateTopics("Related topics", relatedTopics.items);
            $commentsContainer.before($relatedTopics);
        }

        if (relatedVideos && relatedVideos.items.length !== 0) {
            var $relatedVideosToc = generateToc("Related videos");
            $sideToc.append($relatedVideosToc);

            var $relatedVideos = generateTopics("Related videos", relatedVideos.items, false);
            $commentsContainer.before($relatedVideos);
        }

        if (dareTopics && dareTopics.items.length !== 0) {
            var $dareTopicsToc = generateToc("Dare topics");
            $sideToc.append($dareTopicsToc)

            var $dareTopics = generateTopics("Dare topics", dareTopics.items);
            $commentsContainer.before($dareTopics);
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
                return `<a href="${topic.url}">${topic.title || topic.url} [${topic.similarity.toPrecision(3)}]</a>`
            } else {
                return `<a href="${topic.url}" target="_blank">${topic.title || topic.url} [${topic.similarity.toPrecision(3)}]</a>`
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