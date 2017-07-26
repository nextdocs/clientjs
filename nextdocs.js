$(function () {
    "use stict";
    console.log("===:> NextDocs :<===");

    var currentUrl = window.location.href;
    updateDom(currentUrl);

    function updateDom(currentUrl) {
        var $sideToc = $("#side-doc-outline");
        var relatedApiUrl = `https://nextdocs-webapi.azurewebsites.net/api/topics/related?url=${currentUrl}`;
        var mentionedApiUrl = `https://nextdocs-webapi.azurewebsites.net/api/topics/mentioned?url=${currentUrl}`;
        $.when(
            $.get(relatedApiUrl, "json"),
            $.get(mentionedApiUrl, "json")
        ).done(updateDomCore);
    }

    function updateDomCore(relatedData, mentionedData) {
        var $commentsContainer = $("#comments-container");

        if (relatedData != null && relatedData[0].items.length !== 0) {
            var $relatedTopicsToc = generateToc("Related topics");
            $sideToc.append($relatedTopicsToc)

            var $relatedTopics = generateTopics("Related topics", relatedData[0].items);
            $commentsContainer.before($relatedTopics);
        }

        if (mentionedData != null && mentionedData[0].items.length !== 0) {
            var $mentionedByToc = generateToc("Mentioned by");
            $sideToc.append($mentionedByToc);

            var $mentionedBy = generateTopics("Mentioned by", mentionedData[0].items);
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
            var $item = $(`<li><a href="${topic.url}">${topic.title}</a></li>`);
            $topics.append($item);
        }

        $category.append($topics);
        return $category;
    }

    function computeId(name) {
        return name.replace(" ", "_").toLowerCase();
    }
});