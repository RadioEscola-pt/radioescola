import sys
import re

if len(sys.argv) != 2:
    print("Usage: python edit_html.py <input_html_file>")
    sys.exit(1)


input_file = sys.argv[1]

# Read the content of the HTML file
with open(input_file, 'r') as file:
    html_content = file.read()

tag_class_map = [
    {"tag": "select", "class": "w-36 text-sm bg-gray-100 border-none shadow-transparent ring-transparent outline-0 dark:bg-gray-950"},
    {"tag": "input", "class": "w-full border-none shadow-transparent ring-transparent outline-0 dark:bg-gray-900"},
    {"tag": "h1", "class": "text-2xl mb-4"}
]

for mapping in tag_class_map:
    tag = mapping["tag"]
    new_class_value = mapping["class"]
    pattern = rf'<{tag}[^>]*>'
    replacement = f'<{tag} class="{new_class_value}"'

    found_tags = re.findall(pattern, html_content)

    if found_tags:
        print(f"Found {len(found_tags)} <{tag}> tags:")
        for i, found_tag in enumerate(found_tags):
            print(f"{i + 1}. <{tag}> tag attributes: {found_tag}")

    html_content = re.sub(pattern, replacement, html_content)

# Save the modified HTML back to the file
with open(input_file, 'w') as file:
    file.write(html_content)

print(f"{input_file} has been modified.")