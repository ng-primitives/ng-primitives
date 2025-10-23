# Breaking Changes

## Toast

Any data attributes that had boolean values have been changed to presence-based attributes. For example, `data-expanded="true"` is now simply `data-expanded`, and `data-expanded="false"` is represented by the absence of the `data-expanded` attribute. This change now aligns with how we handle boolean attributes in our our other primitives.
