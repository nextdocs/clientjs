$(function () {
    "use stict";
    console.log("===:> nextdocs :<===");

    updateSideToc();
    appendSection();

    function updateSideToc() {
        var $sideToc = $("#side-doc-outline");

        var $relatedTopicsToc = generateToc("Related topics");
        var $mentionedByToc = generateToc("Mentioned by");

        $sideToc.append($relatedTopicsToc).append($mentionedByToc);
    }

    function appendSection() {
        var apiUrl = "https://nextdocs-webapi.azurewebsites.net/api/topics/related?url=https://only-for-testing.html";
        $.get(apiUrl, data => {
            var relatedTopics = JSON.parse(data);
            var $relatedTopics = generateTopics("Related topics", relatedTopics);

            var mentionedByTopics = JSON.parse(data);
            var $mentionedBy = generateTopics("Mentioned by", mentionedByTopics);

            var $commentsContainer = $("#comments-container");
            $commentsContainer.before($relatedTopics).before($mentionedBy);
        }, "text");
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