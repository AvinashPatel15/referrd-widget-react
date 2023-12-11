# Installing `referrd-widget-react` for Next.js

To integrate the `referrd-widget-react` package into your Next.js project, follow the steps below:

## Step 1: Install the Package

Make sure to install the latest version of the `referrd-widget-react` package. Open your terminal and run the following command:

```bash
npm install referrd-widget-react@^1.2.4
```

## Step 2: Set up the Layout

Create a file named `subLayouts.js` in the `layouts` folder of your Next.js project's root directory. Add the following content to set up the layout:

```javascript
// File: layouts/subLayouts.js

'use client';

import { MainRefferalModal } from "referrd-widget-react";

export default function SubLayout({ children }) {
    return (
        <>
            <MainRefferalModal />
            <main>{children}</main>
        </>
    );
}
```

## Step 3: Workflow of the Package

The `referrd-widget-react` package follows a specific flow to display the referral widget:

1. **Check for Active Campaigns:**
   - The package component checks all pages to identify if a campaign is active. A campaign is considered active if a brand user has created a campaign with a given product page URL.

2. **Display Widget after Payment:**
   - The widget is displayed after a successful payment. Ensure that the redirection to the product page where the campaign is active includes the parameter `?payment_success=true`.

3. **Redirect to Product Page with Parameters:**
   - After payment is done, redirect the user to the product page where the campaign is active.
   - Include the parameter `?payment_success=true` in the URL to trigger the display of the widget.

### Examples:

- Normal URL:
  - https://weframe-shop.vercel.app/single-product/1?payment_success=true

- Referral URL:
  - https://weframe-shop.vercel.app/single-product/1?referrd_referral=rbd1r7&referrd_uuid=0bd6ebba-bdac-4bcd-ac72-2cbeef22256f&payment_success=true

Make sure to adapt the examples based on your project's specific URLs and routing. Now, you have successfully installed and configured the `referrd-widget-react` package in your Next.js project.

## Step 4: Technical Support

If you encounter any technical issues or have questions related to the `referrd-widget-react` package, please feel free to contact the system administrator or the Referrd team for assistance.

For technical support, you can reach out via email: [support@referrd-widget.com](mailto:support@referrd-widget.com).

They will be happy to help you with any inquiries or problems you may encounter during the integration or use of the referral widget.

Now you're all set! If you need further assistance, don't hesitate to get in touch with the support team.
