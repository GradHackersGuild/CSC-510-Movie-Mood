import unittest
from bs4 import BeautifulSoup
import os


class TestHTMLRendering(unittest.TestCase):

    def setUp(self):
        # Load the HTML file
        base_path = os.path.abspath("src/templates/new_series.html")
        with open(base_path, 'r', encoding='utf-8') as f:
            html_doc = f.read()
        # Parse the HTML file content using BeautifulSoup
        self.soup = BeautifulSoup(html_doc, 'html.parser')

    # 1. Check if the container div exists and contains the correct class
    def test_container_div_exists(self):
        container = self.soup.find('div', class_='container')
        self.assertIsNotNone(
            container, "Container div with class 'container' not found")

    # 2. Check if the heading1 div exists
    def test_heading1_div_exists(self):
        heading1 = self.soup.find('div', class_='heading1')
        self.assertIsNotNone(heading1, "Heading1 div not found")

    # 3. Check if the <h2> tag exists and contains the correct text
    def test_h2_heading_exists(self):
        h2_heading = self.soup.find('h2')
        self.assertIsNotNone(h2_heading, "Heading h2 not found")
        self.assertIn("Today's Series Coming Soon!",
                      h2_heading.text, "Incorrect h2 heading text")

    # 4. Check if the <h6> tag exists and contains the class tipHeader
    def test_h6_tip_header_exists(self):
        h6 = self.soup.find('h6', class_='tipHeader')
        self.assertIsNotNone(h6, "Tip header h6 not found")
        self.assertIn("Tip: Stay tuned for TODAY's series releases!",
                      h6.text, "Incorrect tip header text")

    # 5. Check if the alert div exists
    def test_alert_div_exists(self):
        alert_div = self.soup.find('div', class_='alert')
        self.assertIsNotNone(alert_div, "Alert div not found")

    # 6. Check the role attribute of the alert div
    def test_alert_role(self):
        alert_div = self.soup.find('div', class_='alert')
        self.assertEqual(alert_div.get('role'), 'alert',
                         "Alert div does not have role='alert'")

    # 7. Check the content of the alert message
    def test_alert_message_content(self):
        alert_div = self.soup.find('div', class_='alert')
        if alert_div:
            self.assertIn("Could not fetch new series",
                          alert_div.text, "Alert message content mismatch")

    # 8. Check if the series-list div exists
    def test_series_list_exists(self):
        series_list = self.soup.find('div', class_='series-list')
        self.assertIsNotNone(series_list, "Series list div not found")

    # 9. Check if the series-item div exists
    def test_series_item_exists(self):
        series_item = self.soup.find('div', class_='series-item')
        self.assertIsNotNone(series_item, "Series item div not found")

    # 10. Check if the <h3> tag exists within the series item
    def test_h3_in_series_item(self):
        series_item = self.soup.find('div', class_='series-item')
        h3 = series_item.find('h3') if series_item else None
        self.assertIsNotNone(h3, "h3 tag not found in series item")

    # 11. Check if the <p> tag exists within the series item
    def test_p_in_series_item(self):
        series_item = self.soup.find('div', class_='series-item')
        p = series_item.find('p') if series_item else None
        self.assertIsNotNone(p, "p tag not found in series item")

    # 12. Check the content of the series-item <h3>
    def test_series_item_h3_content(self):
        series_item = self.soup.find('div', class_='series-item')
        if series_item:
            h3 = series_item.find('h3')
            self.assertIn("{{ series.name }}", h3.text,
                          "Incorrect series-item h3 content")

    # 13. Check the content of the series-item <p>
    def test_series_item_p_content(self):
        series_item = self.soup.find('div', class_='series-item')
        if series_item:
            p = series_item.find('p')
            self.assertIn("Series Original Release Date: {{ series.first_air_date }}", p.text,
                          "Incorrect series-item p content")

    # 15. Check the content of the heading1
    def test_heading1_content(self):
        heading = self.soup.find('div', class_='heading1')
        self.assertIn("Today's Series Coming Soon!",
                      heading.text if heading else '', "Heading1 content mismatch")

    # 16. Check the content of the tipHeader
    def test_tip_header_content(self):
        tip_header = self.soup.find('h6', class_='tipHeader')
        self.assertEqual(tip_header.text.strip(), "✨Tip: Stay tuned for TODAY's series releases! ✨",
                         "Tip header content mismatch")


if __name__ == "__main__":
    unittest.main()
