using System.Collections;
using Avatar.Interface;
using UnityEngine;
using UnityEngine.Networking;

namespace Avatar
{
    public class AvatarDownloader3D : AvatarDownloader
    {
        [SerializeField] AvatarManager m_avatarManager;
        
        public override void DownloadAvatar(
            long avatarCollectionId,
            string metadataAssetUri,
            string tokenId,
            string tokenAssetUri)
        {
            StartCoroutine(
                RequestLoadingAvatar(
                    avatarCollectionId,
                    tokenId,
                    tokenAssetUri));
        }

        private IEnumerator RequestLoadingAvatar(
            long avatarCollectionId,
            string tokenId,
            string tokenAssetUri
        )
        {
            if (m_avatarManager.IsAvatarLoaded(avatarCollectionId, tokenId))
            {
                Debug.LogWarning($"Avatar is already loaded for id {avatarCollectionId}-{tokenId}");
                yield break;
            }
            
            using (UnityWebRequest uwr = UnityWebRequest.Get(tokenAssetUri))
            {
                yield return uwr.SendWebRequest();

                if (uwr.result == UnityWebRequest.Result.Success)
                {
                    m_avatarManager.LoadAvatar(
                        avatarCollectionId,
                        tokenId,
                        null,
                        uwr.downloadHandler.data
                    );
                }
                else
                {
                    Debug.LogWarning($"Failed to Load asset from {tokenAssetUri}");
                }
            }
        }
    }
}