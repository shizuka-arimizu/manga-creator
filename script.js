// グローバル変数
let currentStep = 1;
let formData = {
    episode: '',
    characterImage: null,
    characterImageUrl: '',
    productName: '',
    usage: '',
    pages: '',
    style: ''
};

// 用途とページ数の推奨マッピング
const usageRecommendations = {
    sns: { pages: '1', reason: 'SNS投稿にはサクッと読める1ページがおすすめです' },
    blog: { pages: '2', reason: 'ブログ記事にはバランスの取れた2ページがおすすめです' },
    presentation: { pages: '2', reason: 'プレゼン資料には説得力のある2ページがおすすめです' },
    product: { pages: '3', reason: '商品紹介にはじっくり伝える3ページがおすすめです' },
    education: { pages: '3', reason: '教育資料には詳しく説明できる3ページがおすすめです' },
    newsletter: { pages: '2', reason: 'メルマガには適度な長さの2ページがおすすめです' },
    ad: { pages: '1', reason: '広告にはインパクト重視の1ページがおすすめです' },
    personal: { pages: '2', reason: '記念品には思い出が残る2ページがおすすめです' },
    other: { pages: '2', reason: 'バランスの取れた2ページがおすすめです' }
};

// 用途とスタイルの推奨マッピング
const styleRecommendations = {
    sns: ['rough', 'pop'],
    blog: ['watercolor', 'anime'],
    presentation: ['anime', 'marker'],
    product: ['pop', 'anime'],
    education: ['anime', 'pen'],
    newsletter: ['watercolor', 'anime'],
    ad: ['pop', 'shoujo'],
    personal: ['watercolor', 'shoujo'],
    other: ['anime', 'watercolor']
};

// 用途名のマッピング
const usageNames = {
    sns: 'SNS投稿',
    blog: 'ブログ記事・note',
    presentation: 'プレゼン資料・セミナー',
    product: '商品・サービス紹介',
    education: '教育・研修資料',
    newsletter: 'メルマガ・ニュースレター',
    ad: '広告・宣伝用',
    personal: '個人的な記念・プレゼント',
    other: 'その他'
};

// スタイル名のマッピング
const styleNames = {
    watercolor: 'ふんわり優しい水彩タッチ 🌸',
    shoujo: 'キラキラ少女漫画風 💫',
    anime: 'アニメ風カラフル 🎬',
    rough: 'ゆるふわ手描きラフ ✏️',
    pop: 'カラフルポップ 🌈',
    marker: '大人っぽいマーカー画 🖊️',
    pen: 'シンプルボールペン画 🖋️'
};

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    // 文字数カウント
    const episodeTextarea = document.getElementById('episode');
    const charCountSpan = document.getElementById('charCount');
    
    episodeTextarea.addEventListener('input', (e) => {
        const count = e.target.value.length;
        charCountSpan.textContent = count;
        
        if (count > 1000) {
            charCountSpan.style.color = 'red';
        } else {
            charCountSpan.style.color = '';
        }
    });

    // 画像プレビュー
    const characterImageInput = document.getElementById('characterImage');
    const imagePreview = document.getElementById('imagePreview');
    const fileLabel = document.querySelector('.file-label .file-text');

    characterImageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            formData.characterImage = file;
            
            // ファイル名表示
            fileLabel.textContent = file.name;
            
            // プレビュー表示
            const reader = new FileReader();
            reader.onload = (e) => {
                formData.characterImageUrl = e.target.result;
                imagePreview.innerHTML = `<img src="${e.target.result}" alt="キャラクタープレビュー">`;
            };
            reader.readAsDataURL(file);
        }
    });

    // 用途選択時の推奨表示
    const usageRadios = document.querySelectorAll('input[name="usage"]');
    usageRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            formData.usage = e.target.value;
            updatePageRecommendation();
            updateStyleRecommendation();
        });
    });

    // ページ数選択
    const pageRadios = document.querySelectorAll('input[name="pages"]');
    pageRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            formData.pages = e.target.value;
        });
    });

    // スタイル選択
    const styleRadios = document.querySelectorAll('input[name="style"]');
    styleRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            formData.style = e.target.value;
        });
    });

    // フォーム送信
    const form = document.getElementById('mangaForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        generateManga();
    });
});

// ステップ進行
function nextStep() {
    // 現在のステップのバリデーション
    if (!validateCurrentStep()) {
        return;
    }

    // データ保存
    saveCurrentStepData();

    // ステップ更新
    const currentSection = document.querySelector(`.form-section[data-section="${currentStep}"]`);
    const currentStepElement = document.querySelector(`.step[data-step="${currentStep}"]`);
    
    currentSection.classList.remove('active');
    currentStepElement.classList.remove('active');
    currentStepElement.classList.add('completed');

    currentStep++;

    const nextSection = document.querySelector(`.form-section[data-section="${currentStep}"]`);
    const nextStepElement = document.querySelector(`.step[data-step="${currentStep}"]`);
    
    nextSection.classList.add('active');
    nextStepElement.classList.add('active');

    // ページトップにスクロール
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 最終ステップなら確認表示を更新
    if (currentStep === 5) {
        updateSummary();
    }
}

function prevStep() {
    const currentSection = document.querySelector(`.form-section[data-section="${currentStep}"]`);
    const currentStepElement = document.querySelector(`.step[data-step="${currentStep}"]`);
    
    currentSection.classList.remove('active');
    currentStepElement.classList.remove('active');

    currentStep--;

    const prevSection = document.querySelector(`.form-section[data-section="${currentStep}"]`);
    const prevStepElement = document.querySelector(`.step[data-step="${currentStep}"]`);
    
    prevSection.classList.add('active');
    prevStepElement.classList.remove('completed');
    prevStepElement.classList.add('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// バリデーション
function validateCurrentStep() {
    switch(currentStep) {
        case 1:
            const episode = document.getElementById('episode').value.trim();
            const characterImage = document.getElementById('characterImage').files[0];
            
            if (!episode) {
                alert('エピソードを入力してください');
                return false;
            }
            if (episode.length > 1000) {
                alert('エピソードは1000文字以内で入力してください');
                return false;
            }
            if (!characterImage) {
                alert('キャラクター画像をアップロードしてください');
                return false;
            }
            return true;

        case 2:
            const usage = document.querySelector('input[name="usage"]:checked');
            if (!usage) {
                alert('用途を選択してください');
                return false;
            }
            return true;

        case 3:
            const pages = document.querySelector('input[name="pages"]:checked');
            if (!pages) {
                alert('ページ数を選択してください');
                return false;
            }
            return true;

        case 4:
            const style = document.querySelector('input[name="style"]:checked');
            if (!style) {
                alert('スタイルを選択してください');
                return false;
            }
            return true;

        default:
            return true;
    }
}

// データ保存
function saveCurrentStepData() {
    switch(currentStep) {
        case 1:
            formData.episode = document.getElementById('episode').value.trim();
            formData.productName = document.getElementById('productName').value.trim();
            break;
    }
}

// ページ数推奨の更新
function updatePageRecommendation() {
    const recommendation = usageRecommendations[formData.usage];
    const recommendationText = document.getElementById('pageRecommendation');
    
    if (recommendation) {
        recommendationText.innerHTML = `💡 ${recommendation.reason}`;
        
        // 推奨ページを視覚的に強調
        document.querySelectorAll('.page-card').forEach(card => {
            card.classList.remove('recommended');
        });
        
        const recommendedCard = document.querySelector(`input[name="pages"][value="${recommendation.pages}"]`).closest('.page-card');
        recommendedCard.classList.add('recommended');
    }
}

// スタイル推奨の更新
function updateStyleRecommendation() {
    const recommendations = styleRecommendations[formData.usage];
    const recommendationText = document.getElementById('styleRecommendation');
    
    if (recommendations) {
        const styleNamesList = recommendations.map(s => styleNames[s]).join('、');
        recommendationText.innerHTML = `💡 あなたの用途「${usageNames[formData.usage]}」には、${styleNamesList}がおすすめです！`;
        
        // 推奨スタイルを視覚的に強調
        document.querySelectorAll('.style-card').forEach(card => {
            card.classList.remove('recommended');
        });
        
        recommendations.forEach(styleKey => {
            const recommendedCard = document.querySelector(`input[name="style"][value="${styleKey}"]`).closest('.style-card');
            if (recommendedCard) {
                recommendedCard.classList.add('recommended');
            }
        });
    }
}

// サマリー更新
function updateSummary() {
    document.getElementById('summaryEpisode').textContent = 
        formData.episode.length > 100 ? formData.episode.substring(0, 100) + '...' : formData.episode;
    
    document.getElementById('summaryUsage').textContent = usageNames[formData.usage];
    document.getElementById('summaryPages').textContent = `${formData.pages}ページ`;
    document.getElementById('summaryStyle').textContent = styleNames[formData.style];
}

// 漫画生成
async function generateManga() {
    // UIの切り替え
    document.getElementById('mangaForm').style.display = 'none';
    document.getElementById('loadingSection').style.display = 'block';
    
    const progressFill = document.getElementById('progressFill');
    const loadingMessage = document.getElementById('loadingMessage');
    
    try {
        // プログレス表示のシミュレーション
        const progressSteps = [
            { progress: 20, message: 'エピソードを分析しています...' },
            { progress: 40, message: 'キャラクター設定を作成中...' },
            { progress: 60, message: 'ストーリー構成を設計中...' },
            { progress: 80, message: '漫画を描画中...' },
            { progress: 100, message: '最終調整中...' }
        ];
        
        for (let step of progressSteps) {
            await new Promise(resolve => setTimeout(resolve, 800));
            progressFill.style.width = `${step.progress}%`;
            loadingMessage.textContent = step.message;
        }

        // 実際の生成処理（デモ版では画像URLを返す）
        const result = await callGensparkAPI();
        
        // 結果表示
        displayResult(result);
        
    } catch (error) {
        console.error('生成エラー:', error);
        alert('漫画の生成中にエラーが発生しました。もう一度お試しください。');
        resetForm();
    }
}

// Genspark API呼び出し（デモ版）
async function callGensparkAPI() {
    // 実際のAPI実装では、ここでGensparkの画像生成APIを呼び出します
    // このデモ版ではダミーデータを返します
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // デモ用のダミー画像URL
    const dummyImages = [
        'https://via.placeholder.com/800x1200/9D4EDD/FFFFFF?text=Manga+Page+1',
        'https://via.placeholder.com/800x1200/FF6FB5/FFFFFF?text=Manga+Page+2',
        'https://via.placeholder.com/800x1200/FFB347/FFFFFF?text=Manga+Page+3'
    ];
    
    const pageCount = parseInt(formData.pages);
    
    return {
        success: true,
        images: dummyImages.slice(0, pageCount),
        metadata: {
            episode: formData.episode,
            usage: usageNames[formData.usage],
            pages: formData.pages,
            style: styleNames[formData.style]
        }
    };
}

// 結果表示
function displayResult(result) {
    document.getElementById('loadingSection').style.display = 'none';
    document.getElementById('resultSection').style.display = 'block';
    
    const resultContent = document.getElementById('resultContent');
    let html = '';
    
    result.images.forEach((imageUrl, index) => {
        html += `
            <div class="result-page">
                <h3>ページ ${index + 1}</h3>
                <img src="${imageUrl}" alt="漫画ページ ${index + 1}">
            </div>
        `;
    });
    
    resultContent.innerHTML = html;
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ダウンロード
function downloadManga() {
    alert('ダウンロード機能は実装準備中です。\n\n現在は画像を右クリック→「画像を保存」でダウンロードしてください。');
}

// フォームリセット
function resetForm() {
    // データリセット
    currentStep = 1;
    formData = {
        episode: '',
        characterImage: null,
        characterImageUrl: '',
        productName: '',
        usage: '',
        pages: '',
        style: ''
    };
    
    // UI リセット
    document.getElementById('mangaForm').reset();
    document.getElementById('mangaForm').style.display = 'block';
    document.getElementById('loadingSection').style.display = 'none';
    document.getElementById('resultSection').style.display = 'none';
    
    // ステップリセット
    document.querySelectorAll('.form-section').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelector('.form-section[data-section="1"]').classList.add('active');
    
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active', 'completed');
    });
    document.querySelector('.step[data-step="1"]').classList.add('active');
    
    // 画像プレビュークリア
    document.getElementById('imagePreview').innerHTML = '';
    document.querySelector('.file-label .file-text').textContent = '画像を選択';
    
    // 文字数カウントリセット
    document.getElementById('charCount').textContent = '0';
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
