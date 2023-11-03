document.getElementById('total_bars_button').addEventListener('click', function() {
    const totalBars = this.textContent.replace("Nombre de barres : ", "");
    navigator.clipboard.writeText(totalBars)
        .then(() => {
            document.getElementById('processing_message').innerText = "Nombre de barres copié : " + totalBars;
        })
        .catch(err => {
            console.error('Erreur lors de la copie dans le presse-papiers :', err);
            document.getElementById('processing_message').innerText = "Erreur lors de la copie dans le presse-papiers.";
        });
});

document.getElementById('optimizeButton').addEventListener('click', function() {
    var loader = document.getElementById('loader');
    loader.style.display = 'block';
    document.getElementById('processing_message').innerText = '';
    document.getElementById('result').innerText = '';
    document.getElementById('total_bars_button').style.display = 'none';
    document.getElementById('total_chute').textContent = '';
    document.getElementById('total_pieces').textContent = '';

    var barLength = document.getElementById('bar_length').value;
    var cuts = document.getElementById('cuts').value;

    if (!barLength || !cuts.trim()) {
        loader.style.display = 'none';
        document.getElementById('processing_message').innerText = "Remplissez tous les champs !";
        return;
    }

    cuts = cuts.replace(/^[^\d]+/, '')
                .replace(/\t/g, ',')
                .replace(/\n+/g, ';')
                .replace(/,+/g, ',')
                .replace(/;+/g, ';')          
                .replace(/;+$/, '')
                .replace(/[^\d;,]/g, '');

    try {   
        var data = {
            bar_length: parseInt(barLength),
            bars: cuts.split(';').map(function(cut) {
                var parts = cut.split(',');
                return [parseInt(parts[0].trim()), parseInt(parts[1].trim())];
            })
        };

    } catch (error) {
        loader.style.display = 'none';
        document.getElementById('processing_message').innerText = "Données des tasseaux incorrectes pour l'optimisation !";  
        return;      
    }

    fetch('https://www.gctdevweb.ovh/optimize/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        // Affichage des informations de la réponse pour le débogage
        console.log('Statut de réponse:', response.status, 'Headers:', response.headers);
    
        if (!response.ok) {
            // Si la réponse n'est pas OK, on rejette la promesse avec une erreur
            return response.text().then(text => {
                throw new Error('Erreur du serveur: ' + response.status + ' - ' + text);
            });
        }
        // Retourne la réponse JSON si tout va bien
        return response.json();
    })
    .then(data => {
        // Affichage de la réponse de l'API pour le débogage
        console.log('Réponse de l\'API:', data);
        // Traitement des données reçues...
        let resultText = '';
        for (const [cut, quantity] of Object.entries(data.cuts)) {
            resultText += `${cut} : ${quantity}\n`;
        }
        document.getElementById('result').innerHTML = "Solution de découpe :<br>" + resultText + "<br>";
        document.getElementById('total_bars_button').textContent = "Nombre de barres : " + data.total_bars;
        document.getElementById('total_bars_button').style.display = 'block';
        document.getElementById('total_chute').textContent = "Chutes : " + data.total_waste ;
        document.getElementById('total_pieces').textContent = "Nombre de pièces : " + data.total_bars_cut;
    
        loader.style.display = 'none';
    })
    .catch(error => {
        // Affichage des erreurs dans la console et sur l'interface utilisateur
        console.error('Error:', error);
        document.getElementById('processing_message').innerText = "Une erreur s'est produite : " + error.message;
        loader.style.display = 'none';
    });
    
});
