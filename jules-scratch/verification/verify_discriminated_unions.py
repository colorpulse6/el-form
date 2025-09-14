from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.goto("http://localhost:3004/")

    page.screenshot(path="jules-scratch/verification/01_initial.png")

    # Test AutoDiscriminatedUnionForm
    page.locator('select[name="type"]').first.select_option("dog")
    page.screenshot(path="jules-scratch/verification/02_auto_form_dog.png")

    # Test FormSwitchFieldExample
    page.locator('select[aria-label="kind"]').select_option("b")
    page.screenshot(path="jules-scratch/verification/03_field_example_b.png")

    # Test FormSwitchSelectExample
    page.locator('select[aria-label="type"]').last.select_option("member")
    page.screenshot(path="jules-scratch/verification/04_select_example_member.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
