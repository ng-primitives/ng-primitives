---
name: Styling
order: 3
icon: phosphorPaletteDuotone
---

# Styling

Unlike traditional component libraries, Angular Primitives doesn't come with any built-in styles. This is because no matter how flexible a component library's theming system is, it can never meet the needs of every project or design system.

Angular Primitives gives you a set of basic building blocks that you can structure however you want, letting you style them exactly as you like.

Sure, this means you'll need to put in more effort than you would with an off the shelf component library. If you're just looking to quickly build something without worrying much about its appearance, Angular Primitives might not be the best fit. But if you want a way to quickly create custom components that look and behave exactly the way you want, Angular Primitives is a great choice.

## Approach

Angular Primitives has an opinionated way of handling styling. Each primitive uses `data-*` attributes to reflect its important state. This lets you style the primitives based on their state using CSS, so you don't have to manually toggle classes.

This works with any styling system, whether you're using plain CSS, SCSS, or a utility-first CSS framework like Tailwind CSS.

## Example

If you are using CSS or SCSS, you can style the primitives like this:

```scss
button[data-selected] {
  background-color: blue;
  color: white;
}

button[data-disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}
```

If you are using Tailwind CSS, you can style the primitives like this:

```html
<button
  class="data-disabled:cursor-not-allowed data-selected:bg-blue-500 data-selected:text-white data-disabled:opacity-50"
  ngpToggle
>
  Toggle
</button>
```
