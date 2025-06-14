import urllib.request
import urllib.error
import re
import html


OFFLINE_TRENDING = [
    {
        "repo": "EbookFoundation/free-programming-books",
        "desc": "Free programming books",
        "desc_cn": "免费编程书籍列表",
    },
    {
        "repo": "996icu/996.ICU",
        "desc": "Repo for the 996.ICU movement",
        "desc_cn": "关于996.ICU运动的仓库",
    },
    {
        "repo": "microsoft/vscode",
        "desc": "Visual Studio Code",
        "desc_cn": "微软的开源代码编辑器",
    },
    {
        "repo": "torvalds/linux",
        "desc": "Linux kernel source tree",
        "desc_cn": "Linux内核源代码",
    },
    {
        "repo": "facebook/react",
        "desc": "A JavaScript library for building user interfaces",
        "desc_cn": "用于构建用户界面的JavaScript库",
    },
    {
        "repo": "tensorflow/tensorflow",
        "desc": "An end-to-end open source machine learning platform",
        "desc_cn": "端到端的开源机器学习平台",
    },
    {
        "repo": "kubernetes/kubernetes",
        "desc": "Production-Grade Container Scheduling and Management",
        "desc_cn": "生产级的容器编排和管理平台",
    },
    {
        "repo": "donnemartin/system-design-primer",
        "desc": "Learn how to design large-scale systems",
        "desc_cn": "学习如何设计大规模系统",
    },
    {
        "repo": "public-apis/public-apis",
        "desc": "A collective list of free APIs",
        "desc_cn": "免费API的集合列表",
    },
    {
        "repo": "psf/requests",
        "desc": "A simple, yet elegant, HTTP library",
        "desc_cn": "简单优雅的HTTP库",
    },
]


def fetch_trending():
    """Fetch GitHub trending repositories for today.

    If network access fails, return a predefined offline list.
    """
    url = "https://github.com/trending?since=daily"
    try:
        with urllib.request.urlopen(url, timeout=10) as resp:
            html_data = resp.read().decode("utf-8")
        return parse_trending(html_data)
    except Exception as e:
        print(f"Network unavailable, using offline data: {e}")
        return OFFLINE_TRENDING


def parse_trending(html_data):
    """Parse trending repository info from HTML."""
    repo_pattern = re.compile(
        r'<h2[^>]*>\s*<a href="/(.*?)"[^>]*>.*?</a>.*?</h2>.*?<p[^>]*>(.*?)</p>',
        re.S,
    )
    results = re.findall(repo_pattern, html_data)
    trending = []
    for repo, desc in results[:10]:
        repo = html.unescape(repo.strip())
        desc = re.sub(r'<.*?>', '', desc)
        desc = html.unescape(desc.strip())
        trending.append({"repo": repo, "desc": desc})
    return trending


def translate_to_chinese(text):
    """Translate text to Chinese using googletrans if available."""
    try:
        from googletrans import Translator
    except Exception:
        return text  # Fallback: return original text
    translator = Translator()
    try:
        return translator.translate(text, dest="zh-cn").text
    except Exception:
        return text


def main():
    try:
        trending = fetch_trending()
    except Exception as e:
        print(f"Error fetching trending data: {e}")
        return
    for idx, item in enumerate(trending, 1):
        repo = item.get("repo")
        desc = item.get("desc", "")
        desc_cn = item.get("desc_cn") or translate_to_chinese(desc)
        print(f"{idx}. {repo} - {desc_cn}")


if __name__ == "__main__":
    main()
