module.exports = function(eleventyConfig) {
  // Passthrough static assets
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

  // Add Date filter
  eleventyConfig.addFilter("formatDate", function(dateObj) {
    if (!dateObj) return "";
    const d = new Date(dateObj);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  });

  // Add ISO Date filter
  eleventyConfig.addFilter("isoDate", function(dateObj) {
    if (!dateObj) return "";
    const d = new Date(dateObj);
    return d.toISOString().split("T")[0];
  });

  // Safe JSON filter for hydration
  eleventyConfig.addFilter("jsonify", function(obj) {
    return JSON.stringify(obj || {});
  });

  // Photos Collection
  eleventyConfig.addCollection("photos", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/content/photos/*.md").sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
  });

  // Diary Collection
  eleventyConfig.addCollection("diary", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/content/diary/*.md").sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
  });

  // Documents Collection
  eleventyConfig.addCollection("documents", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/content/documents/*.md").sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site"
    },
    templateFormats: ["njk", "md", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
};
