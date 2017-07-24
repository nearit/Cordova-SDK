# Testing

## Manual recipe trigger

To help with testing, you can manually trigger a recipe.
The `manager` instance has a getter for the `cached` recipe list. 
You can get the list of recipes with the method:

```swift
// Swift
manager.recipes()
```

```objective-c
// Objective-C
[manager recipes];
```
Once you pick the recipe you want to test, use this method to trigger it:

```swift
// Swift
let id = recipe.ID
manager.processRecipe(id)
```

```objective-C
// Objective-C
NSString *ID = recipe.ID
[manager processRecipeWithId:ID];
```
