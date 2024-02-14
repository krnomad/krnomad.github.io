// Sample value for edited_md (contains "undefined" in different positions)
let edited_md = `
---
layout: post
date: 2024-02-13
title: "Sample Post"
tags: [sample, test ]
categories: [Testing ]
pin: true
---

This is a sample post. undefined It may contain undefined in various places.

`;

// Find the index of the first occurrence of "undefined"
const undefinedIndex = edited_md.indexOf("undefined");

// Check if "undefined" exists and remove it
if (undefinedIndex > -1) {
  // Remove "undefined" from the string
  edited_md = edited_md.substring(0, undefinedIndex) + edited_md.substring(undefinedIndex + 9);
}

// Print the result to console
console.log(edited_md);
