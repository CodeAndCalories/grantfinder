import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — GrantLocate",
  description: "Privacy Policy for GrantLocate. Learn how we collect and use information.",
};

export default function PrivacyPage() {
  return (
    <div className="container">
      <div className="static-page">
        <h1>Privacy Policy for GrantLocate</h1>
        <p className="static-intro">
          At GrantLocate, we prioritize the privacy of our visitors. This Privacy Policy document
          contains types of information that is collected and recorded by GrantLocate and how we use it.
        </p>

        <section className="static-section">
          <h2>Log Files</h2>
          <p>
            GrantLocate follows a standard procedure of using log files. These files log visitors
            when they visit websites. All hosting companies do this and is a part of hosting
            services' analytics. The information collected by log files includes internet protocol
            (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp,
            referring/exit pages, and possibly the number of clicks. These are not linked to any
            information that is personally identifiable. The purpose of the information is for
            analyzing trends, administering the site, tracking users' movement on the website, and
            gathering demographic information.
          </p>
        </section>

        <section className="static-section">
          <h2>Cookies and Web Beacons</h2>
          <p>
            Like any other website, GrantLocate uses cookies. These cookies store visitor
            preferences and track which pages visitors access or visit. The information is used
            to optimize the users' experience by customizing our web page content based on
            visitors' browser type and/or other information.
          </p>
        </section>

        <section className="static-section">
          <h2>Google DoubleClick DART Cookie</h2>
          <p>
            Google is one of a third-party vendor on our site. It also uses cookies, known as DART
            cookies, to serve ads to our site visitors based upon their visit to www.website.com
            and other sites on the internet. However, visitors may choose to decline the use of
            DART cookies by visiting the Google ad and content network Privacy Policy at the
            following URL: <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer">https://policies.google.com/technologies/ads</a>.
          </p>
        </section>

        <section className="static-section">
          <h2>Our Advertising Partners</h2>
          <p>
            Some of advertisers on our site may use cookies and web beacons. Our advertising
            partner is listed below:
          </p>
          <ul className="static-list">
            <li>
              <strong>Google AdSense</strong> — Google AdSense may use cookies and web beacons on
              GrantLocate. You can review Google's privacy policy at{" "}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
                https://policies.google.com/privacy
              </a>.
            </li>
          </ul>
        </section>

        <section className="static-section">
          <h2>Third Party Privacy Policies</h2>
          <p>
            GrantLocate's Privacy Policy does not apply to other advertisers or websites. Thus, we
            are advising you to consult the respective Privacy Policies of these third-party ad
            servers for more detailed information. It may include their practices and instructions
            about how to opt-out of certain options.
          </p>
          <p>
            You can choose to disable cookies through your individual browser options. To know more
            detailed information about cookie management with specific web browsers, it can be found
            at the browsers' respective websites.
          </p>
        </section>

        <section className="static-section">
          <h2>Children's Information</h2>
          <p>
            Another part of our priority is adding protection for children while using the internet.
            We encourage parents and guardians to observe, participate in, and/or monitor and guide
            their online activity. GrantLocate does not knowingly collect any Personal Identifiable
            Information from children under the age of 13.
          </p>
        </section>

        <section className="static-section">
          <h2>Contact Us</h2>
          <p>
            If you have additional questions or require more information about our Privacy Policy,
            do not hesitate to <a href="/contact">contact us</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
