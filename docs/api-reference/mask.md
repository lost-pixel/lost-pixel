---
description: Values that can be provided to mask
---

# Mask

* **selector**: `string`
  * **Required**
  * CSS selector for the element to mask
  * Allows you to select an element on the page by its CSS selector. This allows you to specify an area of the image that should be ignored when comparing for differences.
  * Examples:
    * `#my-id`: Selects the element with the id `my-id`
    * `.my-class`: Selects all elements with the class `my-class`
    * `div`: Selects all `div` elements
    * `div.my-class`: Selects all `div` elements with the class `my-class`
    * `li:nth-child(2n)`: Selects all even `li` elements
    * `[data-testid="hero-banner"]`: Selects all elements with the attribute `data-testid` set to `hero-banner`
    * `div > p`: Selects all `p` elements that are direct children of a `div` element

This type `Mask` is used to define areas of the image that should be ignored when comparing for differences. It allow you to specify an area of the image to be ignored by providing a CSS selector that targets the specific element on the page.
