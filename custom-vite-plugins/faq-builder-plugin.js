import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as fs from 'fs';

function buildFaqSchema(faqData) {
  const allQuestions = faqData.flatMap(category =>
    category.questions.map(qa => ({
      "@type": "Question",
      "name": qa.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": qa.a
      }
    }))
  );
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "name": "FAQ | %%SITE_NAME%%",
    "url": "%%SITE_URL%%/faq",
    "description": "FAQ Description",
    "mainEntity": allQuestions
  };
  return `<script id="faq-schema-script" type="application/ld+json">${JSON.stringify(schema)}</script>`;
}

function buildNpcCards(faqData, baseUrl) {
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const assetsPath = resolve(__dirname, '..', 'public', 'assets', 'images');

  return faqData.map((category, index) => {
    const npcNameLower = category.npcName.toLowerCase().replace(/\s+/g, '-');
    const imageName = `faq-${npcNameLower}.png`;
    const placeholderName = 'faq-npc-placeholder.png';

    const imageFilePath = `${assetsPath}/${imageName}`;
    const imageExists = fs.existsSync(imageFilePath);

    const imageUrl = `${cleanBaseUrl}/assets/images/${imageName}`;
    const fallbackImageUrl = `${cleanBaseUrl}/assets/images/${placeholderName}`;
    const finalSrcUrl = imageExists ? imageUrl : fallbackImageUrl;

    const rawDialogueData = JSON.stringify(category.dialogue || []);
    const escapedDialogueData = rawDialogueData.replace(/'/g, '&#39;');

    return `
        <div
            class="npc-card ${index === 0 ? 'active' : ''}"
            data-target="${category.id}"
            data-dialogue='${escapedDialogueData}'
        >
            <div class="dialogue-box">
                <p class="dialogue-text"></p>
                <div class="dialogue-tail"></div>
            </div>
            <img
                class="npc-image"
                src="${finalSrcUrl}"
                alt="${category.npcName}"
                loading="lazy"
                style="opacity:0.9;"
            >
            <div class="npc-name-container">
                <span class="npc-name-main">${category.npcName}</span>
                <span class="npc-name-category">${category.category}</span>
            </div>
        </div>
        `;
  }).join('');
}

function buildFaqContent(faqData) {
  return faqData.map((category, index) => `
        <div class="faq-category-content ${index === 0 ? 'active' : ''}" id="${category.id}">
            ${category.questions.map(qa => `
                <details>
                    <summary>${qa.q}</summary>
                    <div class="details-content">
                        <p>${qa.a}</p>
                    </div>
                </details>
            `).join('')}
        </div>
    `).join('');
}

export function faqBuilderPlugin() {
  let faqData, baseUrl;

  return {
    name: 'vite-plugin-faq-builder',

    configResolved(resolvedConfig) {
      const dataPath = resolve(resolvedConfig.root, 'faq/faq.json');

      if (!fs.existsSync(dataPath)){
        console.warn("[faqBuilderPlugin] faq.json file doesn't exist and the plugin is skipped.");
        return
      }

      try {
        faqData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
      } catch (e) {
        console.error(`[faqBuilderPlugin] Error: Could not read faq.json from ${dataPath}.`);
        console.error(e);
      }

      baseUrl = resolvedConfig.base;
    },

    transformIndexHtml(html, ctx) {
      if (faqData && (ctx.path === '/faq/' || ctx.path === '/faq/index.html')) {

        const schemaHtml = buildFaqSchema(faqData);
        const npcCardsHtml = buildNpcCards(faqData, baseUrl);
        const faqContentHtml = buildFaqContent(faqData);

        return html
          .replace('%%FAQ_SCHEMA%%', schemaHtml)
          .replace('%%FAQ_NPC_CARDS%%', npcCardsHtml)
          .replace('%%FAQ_CONTENT%%', faqContentHtml);
      }

      return html;
    }
  };
}
