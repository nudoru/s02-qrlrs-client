# Scan a QR code and send an LRS statement. 

*Note:* WUT? This isn't React ... No, it's a JSX based "React compatible" framework that I'm creating for fun. It should be "simple" enough to refactor to  React. 

## Beta ...

The `subject` of the LRS statement will be the current user of this app and the `verb` and `object` will be in the scanned code.

## Todo
- Statement security so we don't inject "bad things" into the LRS from a scanned code
- User accounts
- Show a `subject` code for the auth'd user 