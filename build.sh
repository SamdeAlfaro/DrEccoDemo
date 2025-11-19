# Note: you must first install zola on your system or download a prebuilt binary
# (it's pretty much just a binary to generate static web sites)
# https://www.getzola.org/documentation/getting-started/installation/
zola build --base-url "$1"

# Cleanup any previous builds
rm -rf drecco-release.zip drecco

# Rename and zip public directory
mv public drecco
chmod -R 755 drecco
zip -r drecco-release.zip drecco

# Cleanup and remove built directory
rm -rf drecco
