# Site Screenshotter

An easy way to get a screenshot of any webpage and be notified with it via email every x hours.

# Setup

The only setup required is to copy the `.env.example.js` file and paste it as `.env.js`. Then inside the copy, edit the configuration as needed.

## Filling out forms

Incase you need to fill out forms, we have a `form` property you can edit in the `.env.js` file. You can add as many items to the array as you need.

### Text boxes

```
{
  // Set the type to 'text' to indicate we are filling out a textbox
  type: "text",

  // The selector used to locate the correct input on the page
  selector: "input[name=first_name]",

  // Value to fill with
  value: "Dobson"
}
```

### Dropdowns

To get the value of the dropdown you can simply inspect the dropdown element in your browser (in FireFox right click the dropdown and click `Q`). Click the arrow on the left to show child elements and you should see the `<option>`s you can choose from. Copy the text from the `value` in to your configuration.

```
//      ﹀ Copy this value
<option value="56 to 76">56 to 76</option>
```

```
{
  // Set the type to 'dropdown'
  type: "dropdown",

  // The selector used to locate the correct dropdown on the page
  selector: "select[name=age]",

  // Option to select in dropdown
  value: "56 to 76"
}
```
