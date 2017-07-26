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
        var relatedTopics = getRelatedTopics();
        var $relatedTopics = generateTopics("Related topics", relatedTopics);

        var mentionedByTopics = getMentionedByTopics();
        var $mentionedBy = generateTopics("Mentioned by", mentionedByTopics);

        var $commentsContainer = $("#comments-container");
        $commentsContainer.before($relatedTopics).before($mentionedBy);
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

    function getRelatedTopics() {
        // mock
        return [
            {
                "title": "first item",
                "url": "https://github.com"
            },
            {
                "title": "second item",
                "url": "https://github.com"
            }
        ];
    }

    function getMentionedByTopics() {
        // mock
        return [
            {
                "title": "item 1",
                "url": "https://github.com/nextdocs"
            },
            {
                "title": "item 2",
                "url": "https://github.com/nextdocs"
            }
        ]
    }
});