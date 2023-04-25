using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using MYTYKit.AvatarImporter;
using MYTYKit.Components;
using UnityEngine;
using UnityEngine.Networking;

public class Avatar3DLoader : MonoBehaviour
{
    [SerializeField]
    MYTY3DAvatarImporter m_importer;

    private byte[] m_cloneXMainBody;
    private string m_cloneXMetadata;
    private Dictionary<string, byte[]> m_traitMap = new();

    HttpClient m_client;

    public void Load3DAvatarTest()
    {
        Debug.Log("Start Loading from network");
        LoadAvatar(
            1L,
            "CloneX_Female",
            "https://3d-asset-test.s3.ap-southeast-1.amazonaws.com/CloneX/mainbody.zip",
            "0",
            "https://3d-asset-test.s3.ap-southeast-1.amazonaws.com/CloneX/tokenId_0.zip",
            new List<string>{"jacket", "reptile", "smile", "thick", "eyelashes", "bwlcut"}
        );
    }

    public void LoadAvatar(
        long avatarCollectionId,
        string mainbodyGlbName,
        string metadataAssetUri,
        string tokenId,
        string traitsAssetUri,
        List<string> traitNames)
    {
        StartCoroutine(
            LoadMainBody(
                avatarCollectionId,
                mainbodyGlbName,
                metadataAssetUri,
                tokenId,
                traitsAssetUri,
                traitNames
            )
        );
    }

    private IEnumerator LoadMainBody(
        long avatarCollectionId,
        string mainbodyGlbName,
        string metadataAssetUri,
        string tokenId,
        string traitsAssetUri,
        List<string> traitNames)
    {
        using (UnityWebRequest uwr = UnityWebRequest.Get(metadataAssetUri))
        {
            yield return uwr.SendWebRequest();

            if (uwr.result == UnityWebRequest.Result.Success)
            {
                Debug.Log("Main body Download done");
                var bytes = uwr.downloadHandler.data;

                var jsonText = "";
                byte[] mainBodyGlb;
                using (var memoryStream = new MemoryStream(bytes))
                {
                    using (var zipArchive = new ZipArchive(memoryStream, ZipArchiveMode.Read))
                    {
                        var metadataEntry = zipArchive.GetEntry("collection_mas_metadata.json");
                        using (var reader = new StreamReader(metadataEntry.Open()))
                        {
                            jsonText = reader.ReadToEnd();
                        }
                        
                        var glbEntry = zipArchive.GetEntry($"{mainbodyGlbName}.glb");
                        using (var stream = glbEntry.Open())
                        {
                            mainBodyGlb = new byte[glbEntry.Length];
                            stream.Read(mainBodyGlb, 0, mainBodyGlb.Length);
                        }
                    }
                }
                
                m_importer.LoadMainbody(
                    mainBodyGlb,
                    jsonText,
                    (avatar) =>
                    {
                        LoadAvatarCallback(avatar);
                        StartCoroutine(LoadTraits(
                            avatarCollectionId,
                            tokenId,
                            traitsAssetUri,
                            traitNames
                        ));
                    });
            }
            else
            {
                Debug.LogWarning($"Failed to Load asset from ${metadataAssetUri}");
            }
        }
    }

    private IEnumerator LoadTraits(
        long avatarCollectionId,
        string tokenId,
        string traitsAssetUri,
        List<string> traitNames)
    {
        using (UnityWebRequest uwr = UnityWebRequest.Get(traitsAssetUri))
        {
            yield return uwr.SendWebRequest();
            
            if (uwr.result == UnityWebRequest.Result.Success)
            {
                Debug.Log("Traits Download Done");
                var bytes = uwr.downloadHandler.data;

                byte[] traitGlb;
                using (var memoryStream = new MemoryStream(bytes))
                {
                    using (var zipArchive = new ZipArchive(memoryStream, ZipArchiveMode.Read))
                    {
                        foreach (var traitName in traitNames)
                        {
                            var glbEntry = zipArchive.GetEntry($"{traitName}.glb");

                            if (glbEntry != null)
                            {
                                using (var stream = glbEntry.Open())
                                {
                                    traitGlb = new byte[glbEntry.Length];
                                    stream.Read(traitGlb, 0, traitGlb.Length);
                                }
                
                                m_traitMap[traitName] = traitGlb;
                            }
                        }
                    }
                }
                
                foreach (var pair in m_traitMap)
                {
                    m_importer.LoadTrait(pair.Value, pair.Key);
                }
                
                Debug.Log($"{avatarCollectionId} / {tokenId} : Traits All loaded");
            }
            else
            {
                Debug.LogWarning($"Failed to Load asset from ${traitsAssetUri}");
            }
        }
    }

    private void LoadAvatarCallback(GameObject avatar)
    {
        Debug.Log("Main body Load Done");
    }
}
